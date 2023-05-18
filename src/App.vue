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
    const todoStyle = {
      textDecoration: 'line-through',
      color: 'gray'
    };
    const error = ref('');
    
    const addTodo = (todo) => {
      // db에 저장
      error.value = '';
      axios.post("http://localhost:3000/todos", {
        subject: todo.subject,
        completed: todo.completed,
      }).then(res => {
        todos.value.push(res.data);
      }).catch(err => {
        console.log(err);
        error.value = "Somthing wen wrong"
      });
    };

    const toggleTodo = (index) => {
      todos.value[index].completed = !todos.value[index].completed;
    };

    const deleteTodo = (index) => {
      todos.value.splice(index, 1);
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