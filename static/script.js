const htmlEl = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');

function setTheme(themeName) {
    htmlEl.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
}

const currentTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (currentTheme === 'dark' || (!currentTheme && systemDark)) {
    setTheme('dark');
} else {
    setTheme('light');
}

toggleBtn.addEventListener('click', () => {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const storedTheme = localStorage.getItem('theme');
    if (!storedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// 获取所有 link-item
const links = document.querySelectorAll('.link-item');

links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); 
        const url = link.dataset.url;
        // 延迟 0.7s 以便展示背景中的爆炸效果
        setTimeout(() => {
            if (url) window.open(url, '_blank');
        }, 700);
    });
});
