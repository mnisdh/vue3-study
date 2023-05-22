<template>
  <router-view/>
  <div class="container">
    <h2>To-Do List</h2>
    <input
      class="form-control"
      type="text" 
      v-model="searchText"
      placeholder="Search"
      @keyup.enter="searchTodo"
    >
    <hr />
    <TodoSimpleForm @add-todo="addTodo" />
    <div style="color: red">{{ error }}</div>

    <div v-if="!todos.length">
      There is noting to display
    </div>
    <TodoList
      :todos="todos"
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
    />
    <hr />
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li
          v-if="currentPage !== 1"
          class="page-item"
          @click="getTodos(currentPage-1)"
        >
          <a style="cursor: pointer" class="page-link" href="#">Previous</a>
        </li>
        <li
          v-for="page in numberOfPages"
          :key="page"
          class="page-item"
          :class="currentPage === page? 'active': ''"
        >
          <a style="cursor: pointer" class="page-link" @click="getTodos(page)">{{page}}</a>
        </li>
        <li
          v-if="currentPage !== numberOfPages"
          class="page-item"
          @click="getTodos(currentPage+1)"
        >
          <a style="cursor: pointer" class="page-link" href="#">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import TodoSimpleForm from '@/components/TodoSimpleForm.vue';
import TodoList from '@/components/TodoList.vue';
import axios from 'axios';

export default {
  components: {
    TodoSimpleForm,
    TodoList,
  },
  setup() {
    const searchText = ref('');
    const toggle = ref(false);
    const todos = ref([]);
    const numberOfTodos = ref(0);
    const limit = 5;
    const currentPage = ref(1);

    const numberOfPages = computed(() => {
      return Math.ceil(numberOfTodos.value / limit);
    });
    const todoStyle = {
      textDecoration: 'line-through',
      color: 'gray'
    };
    const error = ref('');

    const getTodos = async (page = currentPage.value) => {
      try {
        const res = await axios.get(`http://localhost:3000/todos?subject_like=${searchText.value}&_page=${page}&_limit=${limit}&_sort=id&_order=desc`);
        numberOfTodos.value = res.headers['x-total-count'];
        todos.value = res.data;
        currentPage.value = page;
      } catch (err) {
        console.log(err);
        error.value = "Somthing wen wrong";
      } 
    }

    getTodos();
    
    const addTodo = async (todo) => {
      error.value = '';

      try {
        await axios.post("http://localhost:3000/todos", {
          subject: todo.subject,
          completed: todo.completed,
        });

        getTodos(1);
      } catch (err) {
        console.log(err);
        error.value = "Somthing wen wrong";
      }
    };

    const toggleTodo = async (index, checked) => {
      error.value = "";
      const id = todos.value[index].id;
      try {
        await axios.patch("http://localhost:3000/todos/" + id, {
          completed: checked
        });
        todos.value[index].completed = checked;
      } catch(err) {
        console.log(err);
        error.value = "Somthing wen wrong";
      }
    };

    const deleteTodo = async (index) => {
      error.value = "";
      const id = todos.value[index].id;
      try {
        await axios.delete("http://localhost:3000/todos/" + id);
        getTodos(currentPage.value);
      } catch(err) {
        console.log(err);
        error.value = "Somthing wen wrong";
      }
    };

    const onToggle = () => {
      toggle.value = !toggle.value;
    };

    let timeout = null;
    const searchTodo = () => {
      clearTimeout(timeout);
      getTodos(1);
    };
    watch(searchText, () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        getTodos(1);
      }, 1000)
    });

    return {
      toggle,
      todos,
      addTodo,
      toggleTodo,
      onToggle,
      todoStyle,
      deleteTodo,
      searchText,
      searchTodo,
      numberOfPages,
      currentPage,
      getTodos,
      error,
    };
  }
}
</script>

<style>
  .todo {
    color: gray;
    text-decoration: line-through;
  }
</style>