<template>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Instructional Videos</h5>
          </div>
          <div class="card-body">
            <div class="video-list">
              <a
                v-for="video in videos"
                :key="video.id"
                class="video-item"
                :href="video.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img :src="video.thumbnail" :alt="video.title" />
                <span>{{ video.title }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const videos = [
  {
    id: '6CLwRxxSSPI',
    title: 'Microsoft Teams - How to Apply Custom Virtual Backgrounds',
    url: 'https://www.youtube.com/watch?v=6CLwRxxSSPI',
  },
  {
    id: 'nTcYHOyISug',
    title: 'Google Meet - How to Apply Custom Virtual Backgrounds',
    url: 'https://www.youtube.com/watch?v=nTcYHOyISug',
  },
  {
    id: '6dQNVD9KwTI',
    title: 'Zoom - How to Apply Custom Virtual Backgrounds',
    url: 'https://www.youtube.com/watch?v=6dQNVD9KwTI',
  },
].map((video) => ({
  ...video,
  thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
}));
</script>

<style scoped>
.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.video-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #e9ebec;
  border-radius: 8px;
  background: #fff;
  color: #212529;
  text-decoration: none;
}

.video-item img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #f3f6f9;
}

.video-item span {
  padding: 0 12px 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.video-item:hover {
  border-color: #0192d0;
  color: #0192d0;
}
</style>
