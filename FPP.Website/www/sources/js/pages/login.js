$(function () {
    $('#btn-signin').click(function (e) {
        const password = $("#Password").val();

        $("#Password").val(btoa(unescape(encodeURIComponent(password))));
    });
});