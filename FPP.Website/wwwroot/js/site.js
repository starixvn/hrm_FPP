$(function () {
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
            document.body.classList.toggle('sb-sidenav-toggled');
        }

        sidebarToggle.addEventListener('click', (event) => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem(
                'sb|sidebar-toggle',
                document.body.classList.contains('sb-sidenav-toggled')
            );
        });
    }

    function updateTime() {
        const now = new Date();
        const options = {
            timeZone: 'Asia/Singapore',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        const timeString = now.toLocaleTimeString('en-US', options);
        document.querySelector('.time').textContent = timeString;
    }

    // Initialize time update
    updateTime();
    setInterval(updateTime, 50 * 1000);
});
