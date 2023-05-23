<template>
    <div
        v-for="(todo, index) in todos"
        :key="todo.id"
        class="card mt-2"
    >
        <div 
            class="card-body p-2 d-flex align-items-center"
            style="cursor: pointer"
            @click="moveToPage(todo.id)"
        >
            <div class="flex-grow-1">
                <input
                    class="ml-2 mr-2"
                    type="checkbox"
                    :checked="todo.completed"
                    @change="toggleTodo(index, $event)"
                    @click.stop
                >
                <span
                    :class="{todo: todo.completed}"
                >
                    {{ todo.subject }}
                </span>
            </div>
            <div>
                <button
                    class="btn btn-danger btn-sm"
                    @click.stop="openModal(todo.id)"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
    <teleport to="#modal">
        <Modal
            v-if="showModal"
            @close="closeModal"
            @delete="deleteTodo"
        >
            <template v-slot:title>
                Delete Todo~
            </template>
            <template v-slot:body>
                Are you sure you want to delete this todo!??
            </template>
            <template v-slot:footer>
                <button>
                    Hello
                </button>
            </template>
        </Modal>
    </teleport>
</template>

<script>
import { useRouter } from 'vue-router';
import Modal from '@/components/DeleteModal.vue';
import { ref } from 'vue';

export default {
    components: {
        Modal,
    },
    // props: ["todos"]
    props: {
        todos: {
            type: Array,
            required: true
        }
    },
    emits: ['toggle-todo', 'delete-todo'],
    setup(props, { emit }) {
        const router = useRouter();
        const showModal = ref(false);
        const todoDeleteId = ref(null);
        const toggleTodo = (index, event) => {
            emit('toggle-todo', index, event.target.checked);
        };

        const openModal = (id) => {
            todoDeleteId.value = id;
            showModal.value = true;
        };

        const closeModal = () => {
            todoDeleteId.value = null;
            showModal.value = false;
        };

        const deleteTodo = () => {
            emit('delete-todo', todoDeleteId.value);

            closeModal();
        };

        const moveToPage = (todoId) => {
            console.log(todoId);
            // router.push('/todos/' + todoId);
            router.push({
                name: 'Todo',
                params: {
                    id: todoId
                }
            });
        };

        return {
            toggleTodo,
            deleteTodo,
            moveToPage,
            showModal,
            openModal,
            closeModal,
        };
    }
}
</script>

<style>

</style>