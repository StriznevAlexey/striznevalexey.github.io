
var selected_board = 'empty';
document.getElementById("3.3v").style = "color: rgb(103, 255, 65);";
document.getElementById("plug").style = "color: rgb(103, 255, 65);";
document.getElementById("ri").style = "color: rgb(103, 255, 65);";

var autotest_timer_id;
const autotest_quantity = 99;
var autotest_counter = 0;

function printLog(echo, resp) {

    var now = new Date();
    var log = document.getElementById("log");

    if (echo != "") log.innerHTML += '<div class="page_msg">' + echo + '<div class="group"><div class="time_msg" style="float: right;">' + now.toTimeString().slice(0, 8) + '</div></div></div><br>';
    if (resp != "") log.innerHTML += '<div class="esp_msg">' + resp + '<div class="time_msg">' + now.toTimeString().slice(0, 8) + '</div></div><br>';
    log.scrollTop = 99999;
}

function setBoard(brd) {

    var board_table = document.getElementById("board_table");
    var asic_array = Array.from(document.getElementsByClassName("asics"));

    var board = JSON.parse(brd);

    selected_board = board;
    printLog("Смена платы", "Выбрана плата: " + board.caption)

    var table_inner = '<caption id="table_caption" style="text-align: left; margin-left: 10px;color: rgb(252, 252, 252);">' + board.caption + '</caption><tr>';
    board.numbers.forEach(function (num) {
        if (num != "|") {
            if ((num == "00") | (num == "000")) {
                table_inner += '<td></td>';
            }
            else { table_inner += '<td><div id="' + num + '" class="asics">' + num + '</div></td>'; }
        }
        else { table_inner += "</tr><tr>"; }
    });
    table_inner += "</tr>";
    board_table.innerHTML = table_inner;
    Array.from(document.getElementsByClassName("asics")).forEach(function (asic) {
        asic.style.padding = board.asic_size;
    });

}

function sendSettingAP() {
    var ssid = document.getElementById("ssid");
    var pass = document.getElementById("pass");
    if ((ssid.value.length == 0) | (pass.value.length == 0)) {
        alert("Нет данных!")
    } else if ((ssid.value.length > 32) | (pass.value.length > 64)) {
        alert("Превышено количество символов.")
    } else {
        printLog("Сохранить SSID и PASS", "Настройки подключения сохранены. Для подключения перезагрузите устройство.")
        setModal('modal_system', 'none');
    }
    ssid.value = "";
    pass.value = "";
}

function startUpload() {
    var otafile = document.getElementById("otafile").files;

    if (otafile.length == 0) {
        console.log("No file selected!");
        alert("Файл не выбран");
    } else {
        alert("Представте, что ПО Вашего девайса обновилось.")
    }
}

function setModal(id, state) {
    document.getElementById(id).style.display = state;
}

function highlight_asics(num_chips) {

    var asic_array = Array.from(document.getElementsByClassName("asics"));
    var i = 0;

    asic_array.forEach(function (asic) {
        asic.style.borderColor = "rgb(99, 99, 99)";
    });

    for (let i = 1; i <= num_chips; i++) {
        setTimeout(function () {
            asic_array.forEach(function (asic) {
                if (parseInt(asic.id, 10) == i) {
                    asic.style.borderColor = "rgb(113, 214, 18)";
                }


            });
        }, 5 * i);
    }
}

function uploadEeprom() {
    var eeprom = document.getElementById("eeprom").files;

    if (eeprom.length == 0) {
        alert("Файл не выбран");
        console.log("No file selected!");
    } else {
        alert("Представте, что файл eeprom загружен в устройство.");
    }
}

function sendCmd(cmd, do_not_log) {

    var asic_array = Array.from(document.getElementsByClassName("asics"));

    switch (cmd) {
        case "test": {
            setTimeout(function () {
                sendCmd("pwr_off", true)
                sendCmd("rst_l", true)
            }, 700);
            if (selected_board != 'empty') {
                stop_auto_test();
                sendCmd("pwr_on", true);
                sendCmd("3.3v_on", true);
                sendCmd("rst_h", true)
                printLog("Запуск одиночного теста", "Количество ответивших чипов: " + selected_board.num_chips);
                highlight_asics(selected_board.num_chips);

            }
            else printLog("Запуск одиночного теста", "Плата не выбрана!")
        }; break;
        case "auto_test": {
            if (selected_board != 'empty') {
                if (autotest_counter == 0) {
                    autotest_counter = autotest_quantity
                    auto_test();
                }
            }
            else printLog("Запуск циклического теста", "Плата не выбрана!")
        }; break;

        case "stop_auto_test": {
            printLog("Останов теста", "");
            if (autotest_counter > 0) {
                stop_auto_test();
            } else {
                printLog("", "Циклический тест не запущен");
            }

        }; break;
        case "pwr_on": {
            asic_array.forEach(function (asic) { asic.style.color = "rgb(253, 165, 0)"; });
            if (!do_not_log) printLog("Включить питание", "На чипы подано папряжение питания");
        }; break;
        case "pwr_off": {
            asic_array.forEach(function (asic) { asic.style.color = "rgb(99, 99, 99)"; });
            if (!do_not_log) printLog("Отключить питание", "Напряжение питания с чипов снято");
        }; break;
        case "3.3v_on": {
            document.getElementById("3.3v").style = "color: rgb(103, 255, 65);";
            document.getElementById("plug").style = "color: rgb(103, 255, 65);";
            if (!do_not_log) printLog("Включить 3.3v", "Подано питание на контроллер платы");
        }; break;
        case "3.3v_off": {
            document.getElementById("3.3v").style = "rgb(99, 99, 99);";
            document.getElementById("plug").style = "rgb(99, 99, 99);";
            if (!do_not_log) printLog("Отключить 3.3v", "Питание с контроллера платы снято")
        }; break;
        case "rst_h": {
            document.getElementById("rst").style = "color: rgb(103, 255, 65);";
            if (!do_not_log) printLog("Управление RST", "RST: высокий уровень")
        }; break;
        case "rst_l": {
            document.getElementById("rst").style = "rgb(99, 99, 99);";
            if (!do_not_log) printLog("Управление RST", "RST: низкий уровень")
        }; break;
        case "reboot": {
                document.open();
                document.write("Устройство перезагружено. Обновите страницу.");
                document.close();
        }; break;
        default: break;
    }
}

function auto_test() {
    sendCmd("pwr_on", true);
    sendCmd("3.3v_on", true);
    sendCmd("rst_h", true)
    printLog("Запуск циклического теста", "");
    autotest_timer_id = setInterval(function () {
        printLog("", "Количество ответивших чипов: " + selected_board.num_chips);
        printLog("", "Осталось повторов: " + (autotest_counter));
        highlight_asics(selected_board.num_chips);
        autotest_counter--;
        if (autotest_counter < 0) {
            stop_auto_test();
        }
    }, 1000);

}

function stop_auto_test() {
    autotest_counter = 0;
    clearInterval(autotest_timer_id);
    sendCmd("rst_l", true);
    printLog("", "Тест закончен");
}


