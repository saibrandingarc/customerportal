import { onMounted, onUnmounted, ref } from 'vue';

const SIDEBAR_CLASS = 'vertical-sidebar-enable';
const LAYOUT_ATTR = 'data-layout';
const sidebarOpen = ref(false);

function applySidebarClass(open: boolean) {
  sidebarOpen.value = open;
  document.body.classList.toggle(SIDEBAR_CLASS, open);
}

export function closeSidebar() {
  applySidebarClass(false);
}

export function toggleSidebar() {
  applySidebarClass(!sidebarOpen.value);
}

export function useSidebar() {
  const onResize = () => {
    if (window.innerWidth >= 768) {
      closeSidebar();
    }
  };

  onMounted(() => {
    document.documentElement.setAttribute(LAYOUT_ATTR, 'vertical');
    window.addEventListener('resize', onResize);
  });

  onUnmounted(() => {
    closeSidebar();
    window.removeEventListener('resize', onResize);
  });

  return { toggleSidebar, closeSidebar, sidebarOpen };
}

export { sidebarOpen };
