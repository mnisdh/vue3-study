<template>
  <div class="container">
    <h2>To-Do List</h2>
    <input
      class="form-control"
      type="text" 
      v-model="searchText"
      placeholder="Search"
    >
    <hr />
    <TodoSimpleForm @add-todo="addTodo" />
    <div style="color: red">{{ error }}</div>

    <div v-if="!filteredTodos.length">
      There is noting to display
    </div>
    <TodoList
      :todos="filteredTodos"
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
    />
    <hr />
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item"><a class="page-link" href="#">Previous</a></li>
        <li class="page-item"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item"><a class="page-link" href="#">Next</a></li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import TodoSimpleForm from './components/TodoSimpleForm.vue';
import TodoList from './components/TodoList.vue';
import axios from 'axios';

export default {
  components: {
    TodoSimpleForm,
    TodoList,
  },
  setup() {
    const toggle = ref(false);
    const todos = ref([]);
    const totalPage = ref(0);
    const limit = 3;
    const page = ref(1);
    const todoStyle = {
      textDecoration: 'line-through',
      color: 'gray'
    };
    const error = ref('');

    const getTodos = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/todos?_page=${page.value}&_limit=${limit}`);
        totalPage.value = res.headers['x-total-count'];
        todos.value = res.data;
      } catch (err) {
        console.log(err);
        error.value = "Somthing wen wrong";
      } 
    }

    getTodos();
    
    const addTodo = async (todo) => {
      error.value = '';

      try {
        const res = await axios.post("http://localhost:3000/todos", {
          subject: todo.subject,
          completed: todo.completed,
        });

        todos.value.push(res.data);
      } catch (err) {
        console.log(err);
        error.value = "Somthing wen wrong";
      }
    };

    const toggleTodo = async (index) => {
      error.value = "";
      const id = todos.value[index].id;
      try {
        await axios.patch("http://localhost:3000/todos/" + id, {
          completed: !todos.value[index].completed
        });
        todos.value[index].completed = !todos.value[index].completed;
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
        todos.value.splice(index, 1);
      } catch(err) {
        console.log(err);
        error.value = "Somthing wen wrong";
      }
    };

    const onToggle = () => {
      toggle.value = !toggle.value;
    };

    const searchText = ref('');
    const filteredTodos = computed(() => {
      if(searchText.value) {
        return todos.value.filter(todo => {
          return todo.subject.includes(searchText.value);
        })
      }

      return todos.value;
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
      filteredTodos,
      error,
      totalPage,
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