<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <h2>To-Do List</h2>
      <button
        class="btn btn-primary"
        @click="moveToCreatePage"
      >
        Create Todo
      </button>
    </div>
    
    <input
      class="form-control"
      type="text" 
      v-model="searchText"
      placeholder="Search"
      @keyup.enter="searchTodo"
    >
    <hr />

    <div v-if="!todos.length">
      There is noting to display
    </div>
    <TodoList
      :todos="todos"
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
    />
    <hr />
    <Pagenation
      v-if="todos.length"
      :numberOfPages="numberOfPages"
      :currentPage="currentPage"
      @click="getTodos"
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import TodoList from '@/components/TodoList.vue';
import axios from '@/axios';
import { useToast } from '@/composables/toast';
import { useRouter } from 'vue-router';
import Pagenation from '@/components/Pagenation.vue';

export default {
  components: {
    TodoList,
    Pagenation,
  },
  setup() {
    const router = useRouter();
    const searchText = ref('');
    const toggle = ref(false);
    const todos = ref([]);
    const numberOfTodos = ref(0);
    const limit = 5;
    const currentPage = ref(1);

    const {
      showToast,
      toastMessage,
      toastAlertType,
      triggerToast
    } = useToast();

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
        const res = await axios.get(`todos?subject_like=${searchText.value}&_page=${page}&_limit=${limit}&_sort=id&_order=desc`);
        numberOfTodos.value = res.headers['x-total-count'];
        todos.value = res.data;
        currentPage.value = page;
      } catch (err) {
        console.log(err);
        error.value = "Somthing wen wrong";
        triggerToast('Somthing went wrong', 'danger');
      } 
    }

    getTodos();

    const addTodo = async (todo) => {
      error.value = '';

      try {
        await axios.post('todos', {
          subject: todo.subject,
          completed: todo.completed,
        });

        getTodos(1);
      } catch (err) {
        console.log(err);
        error.value = "Somthing wen wrong";
        triggerToast('Somthing went wrong', 'danger');
      }
    };

    const toggleTodo = async (index, checked) => {
      error.value = "";
      const id = todos.value[index].id;
      try {
        await axios.patch('todos/' + id, {
          completed: checked
        });
        todos.value[index].completed = checked;
      } catch(err) {
        console.log(err);
        error.value = "Somthing wen wrong";
        triggerToast('Somthing went wrong', 'danger');
      }
    };

    const deleteTodo = async (id) => {
      error.value = "";
      
      try {
        await axios.delete('todos/' + id);
        getTodos(currentPage.value);
      } catch(err) {
        console.log(err);
        error.value = "Somthing wen wrong";
        triggerToast('Somthing went wrong', 'danger');
      }
    };

    const onToggle = () => {
      toggle.value = !toggle.value;
    };

    const moveToCreatePage = () => {
      router.push({
        name: "TodoCreate"
      });
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
      showToast,
      toastMessage,
      toastAlertType,
      triggerToast,
      moveToCreatePage,
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