<template>
  <div class="home">
    <a-layout-content style="padding: 0 50px">
      <a-breadcrumb style="margin: 16px 0">
      </a-breadcrumb>
      <a-layout style="padding: 24px 0; background: #fff">
        <a-layout-sider width="200" style="background: #fff">
          <a-menu
              v-model:selectedKeys="selectedKeys2"
              v-model:openKeys="openKeys"
              mode="inline"
              style="height: 100%"
              @click="handleClick"
          >
            <a-menu-item key="welcome">
              <MailOutlined />
              <span>欢迎</span>
            </a-menu-item>
            <a-sub-menu v-for="item in level1" :key="item.id" >
              <template v-slot:title>
                <span><user-outlined />{{item.name}}</span>
              </template>
              <a-menu-item v-for="child in item.children" :key="child.id">
                <MailOutlined /><span>{{child.name}}</span>
              </a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>
        <a-layout-content :style="{ padding: '0 24px', minHeight: '280px' }">
<!--          <pre>{{ebooks}}</pre>-->
          <div class="welcome" v-show="isShowWelcome">

            <h1>欢迎使用wiki知识库</h1>
          </div>
          <a-list v-show="!isShowWelcome" item-layout="vertical" size="large"  :data-source="ebooks" :grid="{gutter:20,column:3}">
            <template #renderItem="{ item }">
              <a-list-item key="item.name">
                <template #actions>
          <span v-for="{ type, text } in actions" :key="type">
            <component :is="type" style="margin-right: 8px" />
            {{ text }}
          </span>
                </template>

                <a-list-item-meta :description="item.description">
                  <template #title>
                    <router-link :to="'/doc?ebookId='+item.id">
                      {{item.name}}
                    </router-link>
                  </template>
                  <template #avatar><a-avatar :src="item.cover" /></template>
                </a-list-item-meta>
                {{ item.content }}
              </a-list-item>
            </template>
          </a-list>
        </a-layout-content>
      </a-layout>
    </a-layout-content>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref,onMounted } from 'vue';
import { StarOutlined, LikeOutlined, MessageOutlined, MailOutlined, UserOutlined} from '@ant-design/icons-vue';
import axios from "axios";
import {message} from "ant-design-vue";
import {Tool} from "@/utils/tool";

export default defineComponent({
  components: {
    StarOutlined,
    LikeOutlined,
    MessageOutlined,
  },
  name:'HomeView',
  setup(){
    const pagination = {
      onChange: (page: number) => {
        console.log(page);
      },
      pageSize: 3,
    };
    const actions: Record<string, string>[] = [
      { type: 'StarOutlined', text: '156' },
      { type: 'LikeOutlined', text: '156' },
      { type: 'MessageOutlined', text: '2' },
    ];

    //分类相关
    const level1 = ref();
    let categorys:any;
    /*
    * 查询所有分类*/
    const  handleQueryCategory = ()=>{
      axios.get("/category/allList").then((resp)=>{
        const data = resp.data;
        categorys = data.content;

        if (data.success){
          console.log(data.content)
          console.log("原始数组：",data.content);

          level1.value = [];
          level1.value = Tool.array2Tree(data.content,0);
          console.log("树形结构：",level1);
        } else {
          message.error(data.message);
        }
      });
    };

    const books = ref()
    const handleQueryEbook = ()=>{
      axios.get("/ebook/getEbookListByPage",{
        params:{
          page:1,
          size:1000,
          category2Id:category2id,
        }
      }).then(function (resp){
        const data = resp.data.content.list;
        ebooks.value = data;
      })
    }

    const isShowWelcome = ref(true);
    // 触发点击菜单
    let category2id = 0;
    const handleClick = (value:any)=>{
      if (value.key === 'welcome'){
        isShowWelcome.value = true;
      }else {
        category2id = value.key;
        isShowWelcome.value = false;
        handleQueryEbook()
      }
    }

    const ebooks = ref();
    onMounted(()=>{
      handleQueryCategory();
    })
    return{
      ebooks,
      pagination,
      actions,
      level1,
      handleClick,
      isShowWelcome,

    }
  }
})
</script>

<style scoped>
  .ant-avatar{
    width: 50px;
    height: 50px;
    line-height: 50px;
    border-radius: 8%;
    margin: 5px 0;
  }
</style>
