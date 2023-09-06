<template>

  <a-layout>
    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <p>
        <a-form layout="inline" :model="param">
          <a-form-item>
            <a-input v-model:value="param.name" placeholder="名称">
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleQuery()">
              查询
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="add()">
              新增
            </a-button>
          </a-form-item>
        </a-form>
      </p>
      <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="level1"
          :pagination="false"
          :loading="loading"
          @change="handleTableChange"
      >
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar" style="width: 20%;height: 20%"/>
        </template>
        <template v-slot:action="{ text, record }">
          <a-space size="small">
            <a-button type="primary" @click="edit(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="删除后无法恢复，确定删除吗?"
              ok-text = '是'
              cancel-text = '否'
              @confirm="handleDelete(record.id)"
            >
              <a-button type="danger">
                删除
              </a-button>
            </a-popconfirm>

          </a-space>
        </template>
      </a-table>

    </a-layout-content>
  </a-layout>

  <a-modal
      title="分类表单"
      v-model:visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
  >
    <a-form :model="category" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">


      <a-form-item label="名称">
        <a-input v-model:value="category.name" />
      </a-form-item>
      <a-form-item label="父分类">
        <a-input v-model:value="category.parent" />
        <a-select
            v-model:value="category.parent"
            ref="select"
        >
          <a-select-option value="0">
            无
          </a-select-option>
          <a-select-option v-for="c in level1" :key="c.id" :value="c.id" :disabled="category.id===c.id">
            {{c.name}}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="顺序">
        <a-input v-model:value="category.sort" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts">
import { defineComponent ,onMounted,ref} from 'vue';
import axios from 'axios';
import {Tool} from "@/utils/tool.ts";
import {message} from "ant-design-vue";




export default defineComponent({
  name: 'AdminEbook',
  /*components: {

  },*/
  setup(){
    const categorys = ref();

    const param = ref();
    param.value={};

    const loading = ref(false);
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '父分类',
        slots: 'parent'
      },
      {
        title: '顺序',
        dataIndex: 'sort'
      },
      {
        title: 'Action',
        key: 'action',
        slots: { customRender: 'action' }
      }
    ];

    /*
    * 数据查询
    * */
    const level1 = ref();
    const  handleQuery = ()=>{
      loading.value = true;
      level1.value = [];
      axios.get("/category/allList",{
        params:{
          name:param.value.name,
        }
      }).then((resp)=>{
        loading.value = false;
        const  data = resp.data;

        if(data.success){
          console.log(data.content)
          console.log("原始数组：",data.content);

          level1.value = [];
          if (JSON.stringify(param.value)=='{}'){
            level1.value = Tool.array2Tree(data.content,0);
            console.log(11);
          }else {
            level1.value = data.content;
          }

          param.value={};

          console.log("树形结构：",level1);
        }else {
          message.error(data.message);
        }
      });
    };
    onMounted(()=>{
      handleQuery();
    })

    // -------- 表单 ---------
    const category = ref()
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const handleModalOk = () => {
      modalLoading.value = true;
      axios.post("/category/save",category.value).then((resp)=>{
        const data = resp.data;
        if(data.success){
          modalVisible.value = false;
          modalLoading.value = false;
          handleQuery();
        }
      })

      setTimeout(() => {
        modalVisible.value = false;
        modalLoading.value = false;
      }, 2000);
    };
    //编辑
    const edit = (record:any)=>{
      category.value = record;
      modalVisible.value =true;
    }
    //新增
    const add = () => {
      category.value = {};
      modalVisible.value = true;
    }
    // 删除
    const handleDelete = (id:number)=>{
      axios.get("/category/remove",{params:{id:id}}).then((resp)=>{
        if (resp.data.success){
          // 重新加载列表 （调用数据查询，设置分页参数）
          handleQuery()
        }
      })
    }
    return {
      param,
      handleQuery,

      categorys,
      columns,
      loading,
      level1,

      category,
      edit,
      add,

      modalVisible,
      modalLoading,
      handleModalOk,
      handleDelete,

    }
  }
});
</script>