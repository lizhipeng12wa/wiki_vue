<template>

  <a-layout>
    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <a-row :gutter="24">
        <a-col :span="8">
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
              v-if="level1.length > 0"
              :columns="columns"
              :row-key="record => record.id"
              :data-source="level1"
              :pagination="false"
              :loading="loading"
              size="small"
              :defaultExpandAllRows="true"
          >
            <template #name="{ text: record }">
              {{record.sort}} {{text}}
            </template>
            <template v-slot:action="{ text, record }">
              <a-space size="small">
                <a-button type="primary" @click="edit(record)" size="small">
                  编辑
                </a-button>
                <a-popconfirm
                    title="删除后无法恢复，确定删除吗?"
                    ok-text = '是'
                    cancel-text = '否'
                    @confirm="handleDelete(record.id)"
                >
                  <a-button type="danger" size="small">
                    删除
                  </a-button>
                </a-popconfirm>

              </a-space>
            </template>
          </a-table>
        </a-col>
        <a-col :span="16" >
          <p>
            <a-form layout="inline" :model="param">
              <a-form-item>
                <a-button type="primary"  @click="handleSave()">
                  保存
                </a-button>
              </a-form-item>
            </a-form>
          </p>
          <a-form :model="doc" layout="vertical">
            <a-form-item label="名称">
              <a-input v-model:value="doc.name" placeholder="名称"/>
            </a-form-item>
            <a-form-item >
              <a-tree-select
                  v-model:value="doc.parent"
                  style="width: 100%"
                  :dropdown-style="{maxHeight:'400px',overflow:'auto'}"
                  :tree-data="treeSelectData"
                  placeholder="请选择父文档"
                  tree-default-expand-all
                  :field-names="{children:'children',label:'name',value:'id'}"
              >
              </a-tree-select>
            </a-form-item>

            <a-form-item >
              <a-input v-model:value="doc.sort" placeholder="顺序"/>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handlePreviewContent()">
                  <EyeOutlined/>内容预览
              </a-button>
            </a-form-item>
            <a-form-item label="内容">
              <div id="content"></div>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>

      <a-drawer width="900" placement="right" :closable="false" :visible="drawerVisible" @close="onDrawerClose">
        <div class="wangeditor" :innerHTML="previewHtml"></div>
      </a-drawer>
    </a-layout-content>
  </a-layout>

<!--  <a-modal
      title="文档表单"
      v-model:visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
  >
  </a-modal>-->
</template>
<script lang="ts">
import { defineComponent ,onMounted,ref,createVNode} from 'vue';
import axios from 'axios';
import {Tool} from "@/utils/tool.ts";
import {message, Modal} from "ant-design-vue";
import {useRoute} from "vue-router";
import {EyeOutlined} from "@ant-design/icons-vue";
import ExclamationCircleOutlined from "@ant-design/icons-vue/ExclamationCircleOutlined";
import E from 'wangeditor';
export default defineComponent({
  name: 'AdminDoc',
  components: {
    EyeOutlined,
  },
  setup(){
    const route = useRoute();
    const categorys = ref();

    const param = ref();
    param.value={};

    const treeSelectData = ref();
    treeSelectData.value = [];


    const loading = ref(false);
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: 'Action',
        key: 'action',
        slots: { customRender: 'action' }
      }
    ];

    const level1 = ref();//一级属性文档，children属性就是二级文档
    level1.value = [];


    /*
    * 数据查询
    * */
    const  handleQuery = ()=>{
      loading.value = true;
      level1.value = [];
      axios.get("/doc/allList/"+route.query.ebookId).then((resp)=>{
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

          treeSelectData.value = Tool.copy(level1.value) || [];
          treeSelectData.value.unshift({id:0,name:'无'});
        }else {
          message.error(data.message);
        }
      });
    };

    let editor:E;

    //-----------富文本预览------------
    const drawerVisible = ref(false);
    const previewHtml = ref();
    const handlePreviewContent = () => {
      const html = editor.txt.html();
      previewHtml.value = html;
      drawerVisible.value = true;
    };
    const onDrawerClose = () => {
      drawerVisible.value = false;
    };


    onMounted(()=>{
      editor = new E('#content');
      editor.config.uploadImgShowBase64 = true;
      editor.config.zIndex = 0;
      editor.i18next = null;
      editor.create();
      handleQuery();
    })

    // -------- 表单 ---------
    const doc = ref();
    doc.value = {
      ebookId:route.query.ebookId,
    };
    const modalVisible = ref(false);
    const modalLoading = ref(false);


    const handleSave = () => {
      modalLoading.value = true;
      doc.value.content = editor.txt.html();
      axios.post("/doc/save",doc.value).then((resp)=>{
        modalLoading.value = false;
        const data = resp.data;
        if(data.success){
          message.success("保存成功")

          //重新加载
          handleQuery();
        }
      })

      setTimeout(() => {
        modalVisible.value = false;
        modalLoading.value = false;
      }, 2000);
    };

    /**
     * 内容查询
     **/
    const handleQueryContent = () => {
      axios.get("/doc/findContentById/" + doc.value.id).then((response) => {
        const data = response.data;
        if (data.success) {
          editor.txt.html(data.content)
        } else {
          message.error(data.message);
        }
      });
    };

    //编辑
    const edit = (record:any)=>{
      //清空富文本编辑器
      editor.txt.html("");
      modalVisible.value =true;
      doc.value = Tool.copy(record);
      handleQueryContent();

      //避免选择当前节点和父节点，避免树结构断裂
      treeSelectData.value = Tool.copy(level1.value);
      setDisable(treeSelectData.value,record.id);

      //为选择树添加一个“无”
      treeSelectData.value.unshift({id:0,name:'无'})
    }
    //新增
    const add = () => {
      //清空富文本编辑器
      editor.txt.html("");
      modalVisible.value = true;
      doc.value = {
        ebookId:route.query.ebookId,
      };
      treeSelectData.value = Tool.copy(level1.value) || [];
      //为选择树添加一个“无”
      treeSelectData.value.unshift({id:0,name:'无'})
    }
    // 删除
    const handleDelete = (id:number)=>{
      // 清空数组，否则多次删除时，数组会一直增加
      ids.length = 0;
      deleteNames.length = 0;
      getDeleteIds(level1.value,id);
      Modal.confirm({
        title: '重要提醒',
        icon: createVNode(ExclamationCircleOutlined),
        content: '将删除：【' + deleteNames.join("，") + "】删除后不可恢复，确认删除？",
        onOk() {
          // console.log(ids)
          axios.get('/doc/remove?ids='+ids.join(",")).then((response) => {
            const data = response.data; // data = commonResp
            if (data.success) {
              // 重新加载列表
              handleQuery();
            } else {
              message.error(data.message);
            }
          });
        },
      });
    };
    /**
     * 将某节点及其子孙节点全部置为disabled
     */
    const setDisable = (treeSelectData: any, id: any) => {
      // console.log(treeSelectData, id);
      // 遍历数组，即遍历某一层节点
      for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
          // 如果当前节点就是目标节点
          console.log("disabled", node);
          // 将目标节点设置为disabled
          node.disabled = true;

          // 遍历所有子节点，将所有子节点全部都加上disabled
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            for (let j = 0; j < children.length; j++) {
              setDisable(children, children[j].id)
            }
          }
        } else {
          // 如果当前节点不是目标节点，则到其子节点再找找看。
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            setDisable(children, id);
          }
        }
      }
    };

    /**
     * 查找整根树枝
     */
    const ids:Array<string> = [];
    const deleteNames: Array<string> = [];
    const getDeleteIds = (treeSelectData: any, id: any) => {
      // console.log(treeSelectData, id);
      // 遍历数组，即遍历某一层节点
      for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
          // 如果当前节点就是目标节点
          console.log("delete", node);
          // 将目标ID放入结果集ids
          // node.disabled = true;
          ids.push(id);
          deleteNames.push(node.name);
          // 遍历所有子节点
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            for (let j = 0; j < children.length; j++) {
              getDeleteIds(children, children[j].id)
            }
          }
        } else {
          // 如果当前节点不是目标节点，则到其子节点再找找看。
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            getDeleteIds(children, id);
          }
        }
      }
    };



    return {
      param,
      handleQuery,

      categorys,
      columns,
      loading,
      level1,
      treeSelectData,
      handlePreviewContent,
      onDrawerClose,
      drawerVisible,
      previewHtml,

      doc,
      edit,
      add,

      modalVisible,
      modalLoading,
      handleSave,
      handleDelete,


    }
  }
});
</script>