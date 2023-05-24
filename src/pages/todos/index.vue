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
import TodoList from '@/components/TodoList.vue';
import axios from '@/axios';
import { useToast } from '@/composables/toast';
import { useRouter } from 'vue-router';

export default {
  components: {
    TodoList
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

    // const showToast = ref(false);
    // const toastMessage = ref('');
    // const toastAlertType = ref('');
    // const toastTimeout = ref(null);
    // const triggerToast = (message, type = 'success') => {
    //   toastMessage.value = message;
    //   toastAlertType.value = type;
    //   showToast.value = true;
    //   toastTimeout.value = setTimeout(() => {
    //     toastMessage.value = '';
    //     toastAlertType.value = '';
    //     showToast.value = false;
    //   }, 3000);
    // }

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