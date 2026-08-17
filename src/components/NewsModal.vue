<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click="emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Nouveautés !</h2>
          <button class="close-btn" @click="emit('close')">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <article
            class="article-item"
            v-for="(article, index) in articles
            "
            :key="index"
          >
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-text">{{ article.text }}</p>
            <img
              v-for="(image, imgIndex) in article.images"
              :key="imgIndex"
              :src="image"
              :alt="article.title"
              class="article-image"
            />
          </article>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { articles } from "../articles";
const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>
<style lang="css" scoped>

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: min(90%, 500px);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5em;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2em;
  line-height: 1;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5em;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2em;
}

.article-item {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.article-title {
  margin: 0;
  font-size: 1.3em;
  color: #005fad;
}

.article-text {
  margin: 0;
  color: #4a4a4a;
  line-height: 1.5;
}

.article-image {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
  max-height: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (prefers-color-scheme: dark) {
  .modal-content {
    background-color: #1e1e1e;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    border-bottom: 1px solid #333;
  }
  
  .modal-header h2 {
    color: #ffffff;
  }

  .close-btn {
    color: #a0a0a0;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  .article-title {
    color: #60a5fa;
  }

  .article-text {
    color: #d1d5db;
  }
}
</style>
