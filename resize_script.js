document.getElementById('wrapper').style.transform = "scale(" + document.documentElement.clientWidth / 1920 + ")";
window.addEventListener('resize', function (event) {
    var getWidthWin = document.documentElement.clientWidth;
    document.getElementById('wrapper').style.transform = "scale(" + document.documentElement.clientWidth / 1920 + ")";
});