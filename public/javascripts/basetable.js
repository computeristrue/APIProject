//格式化使能够显示tips
function paramsMatter(value, row, index) {
    var values = value + "";
    if (values && values != 'null' && values != "undefined") {
        values = values.replace(/\s+/g, '&nbsp;')
        if (typeof value === 'number') {
            value = formatForNumber(value);
            values = value;
        }
        console.log(typeof value);
        if (typeof value === 'date') {
            value = formatForDate(value);
            values = value;
        }
        return '<span class="tips" title="' + values + '">' + value + '</span>'
    } else {
        return '';
    }
}

//格式化带有省份使能够显示tips
function paramsMatterWithProvince(value, row, index) {
    var values = value + "";
    if (values && values != 'null' && values != undefined) {
        values = values.replace(/\s+/g, '&nbsp;')
        if (typeof value === 'number') {
            value = formatForNumber(value);
            values = value;
        }
        if (typeof value === 'date') {
            value = formatForDate(value);
            values = value;
        }
        var province = row.province;
        return '<span class="tips" title="' + values + '" province="' + province + '">' + value + '</span>'
    } else {
        return '';
    }
}
var oldTitle = null;

//显示tips实现
function showTips(event) {
    var left = event.pageX,
        top = event.pageY;
    var ele = event.target;
    var title = ele.title;
    var type = event.originalEvent.type;
    if (type == 'mouseover') {
        oldTitle = title;
        ele.title = '';
        if (title != null) {
            var showEle = $('<div></div>', {
                text: title,
                class: 'showTitleBox'
            }).css({
                maxWidth: '250px',
                wordWrap: 'break-word',
                wordBreak: 'break-all',
                position: 'absolute',
                top: top + 10,
                left: left,
                border: '1px solid gray',
                borderRadius: '5px',
                display: 'block',
                backgroundColor: 'gray',
                color: 'white',
                height: 'auto',
                lineHeight: '38px',
                fontWeight: 'normal',
                padding: '0 8px 0 8px',
            })
            showEle.appendTo('body');
        }
    } else if (type == 'mouseout') {
        ele.title = oldTitle;
        $('.showTitleBox').remove();
    } else if (type == 'mousemove') {
        $('.showTitleBox').css({
            top: top + 10,
            left: left
        })
    }
}


//格式化number类型的数据
function formatForNumber(value) {
    var result = [],
        counter = 0;
    value = Number(value.toFixed(2)).toString();
    var isMinus = false;
    if (value < 0) isMinus = true;
    value = Math.abs(value).toString();
    var num_array = value.split('.');
    var num = num_array[0];
    var newstr = '';
    for (var i = num.length - 1; i >= 0; i--) {
        counter++;
        result.unshift(num[i]);
        if (!(counter % 3) && i != 0) {
            result.unshift(',');
        }
    }
    if (num_array.length > 1) {
        newstr = result.join('');
        newstr += '.' + num_array[1];
        if (isMinus) newstr = `-${newstr}`;
        return newstr;
    } else {
        newstr = result.join('');
        if (isMinus) newstr = `-${newstr}`;
        return newstr;
    }
}

/**
 * 格式化日期类型
 */
function formatForDate(value) {
    if (value) {
        var date = new Date(value);
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentDate = date.getFullYear() + "-" + month + "-" + strDate
            + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        value = currentDate;
    }
    return value;
}

/**
 * 获取信息
 */
function getInfo(name, customerArr, saleChanceArr, salechanceMoneyArr, agreeMentArr, agreeMentMoneyArr, preOrderArr, preOrderMoneyArr) {
    var customer = 0,
        salechance = 0,
        salechanceMoney = 0,
        agreeMent = 0,
        agreeMentMoney = 0,
        preOrder = 0,
        preOrderMoney = 0;
    customerArr.forEach(rec => {
        if (rec.name == name)
            customer = rec.value;
    });
    saleChanceArr.forEach(rec => {
        if (rec.name == name)
            salechance = rec.value;
    });
    salechanceMoneyArr.forEach(rec => {
        if (rec.name == name)
            salechanceMoney = rec.value;
    });
    agreeMentArr.forEach(rec => {
        if (rec.name == name)
            agreeMent = rec.value;
    });
    agreeMentMoneyArr.forEach(rec => {
        if (rec.name == name)
            agreeMentMoney = rec.value;
    });
    preOrderArr.forEach(rec => {
        if (rec.name == name)
            preOrder = rec.value;
    });
    preOrderMoneyArr.forEach(rec => {
        if (rec.name == name)
            preOrderMoney = rec.value;
    });
    return {
        customer: customer,
        salechance: salechance,
        salechanceMoney: salechanceMoney,
        agreeMent: agreeMent,
        agreeMentMoney: agreeMentMoney,
        preOrder: preOrder,
        preOrderMoney: preOrderMoney
    }
}

function createMOHU(name, type, moduleId, condition = null) {
    var textName = name;
    var hiddenName = name.replace("Text", "");
    var showField = name.replace("Text", "Show");
    var valueField = "", labelField = "name";
    var url = "";
    if (type == "customer") {
        url = "getCustomer";
        valueField = "id";
    }
    if (type == "owner") {
        url = "getOwner";
        valueField = "id";
    }
    if (type == "product") {
        url = "getProductMOHU";
        valueField = "decode";
        labelField = "extend3"
    }
    if (type == "dept") {
        url = "getDeptMOHU";
        valueField = "id";
    }
    if (type == 'pinpai') {
        url = "getPinPai";
        valueField = "extend75"
    }
    if (type == 'xinghao') {
        url = 'getXingHao';
        valueField = "extend12";
    }
    $(`#${textName}`).bind("input propertychange", function (event) {
        var thiVal = $(`#${textName}`).val();
        if (!thiVal) {
            $(`#${hiddenName}`).val(null);
            $(`#${showField}`).hide();
        }
    });
    $(`#${textName}`).autocomplete({
        delay: 500,
        source: function (request, response) {
            var params = {
                "key": $(`#${textName}`).val(),
                "moduleId": moduleId
            }
            if (condition) {
                for (var key in condition) {
                    params[key] = condition[key];
                }
            }
            $.ajax({
                url: url,
                type: "get",
                data: params,
                async: false,
                success: function (data) {
                    response($.map(data.arr, function (item) {
                        return {
                            label: item[labelField],
                            value: item[valueField],
                            dataId: item.id
                        }
                    }));
                }
            });
        },
        delay: 20,
        response: function (event, ui) {
            if (ui.content.length <= 0) {
                $(`#${showField}`).show();//展示没有搜索内容
                $(`#${hiddenName}`).val(null);
            } else {
                $(`#${showField}`).hide();
            }
        },
        select: function (event, ui) {
            $(this).value = ui.item.label;
            $(`#${hiddenName}`).val(ui.item.value);
            if (type == "customer") $("#customerId").val(ui.item.dataId);
            if (type == "owner") $("#ownerId").val(ui.item.dataId);
            ui.item.value = ui.item.label;
            $(`#${textName}`).val(ui.item.label);
        }
    })
}

/**
 * 弹出式提示框，默认1.2秒自动消失
 * @param message 提示信息
 * @param style 提示样式，有alert-success、alert-danger、alert-warning、alert-info
 * @param time 消失时间
 */
function prompt(message, style = 'alert-success', time = 1200) {
    $('<div>')
        .appendTo('body')
        .addClass('alert ' + style)
        .html(message)
        .show()
        .delay(time)
        .fadeOut();
};

/**
 * 获取URL中的参数
 * @return object
 */
function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

/**
 * 初始化部门树
 * @Param elemId
 * @Param treeSelect
 **/
function initDeptTree(elemId, treeSelect) {
    treeSelect.render({
        // 选择器
        elem: `#${elemId}`,
        // 数据
        // data: "data.json",
        data: 'deptTree',
        // 异步加载方式：get/post，默认get
        type: 'get',
        // 占位符
        placeholder: '选择部门',
        // 是否开启搜索功能：true/false，默认false
        search: true,
        // 点击回调
        click: function (d) {
        },
        // 加载完成后的回调函数
        success: function (d) {
            //                选中节点，根据id筛选
            //                treeSelect.checkNode('tree', 3);

            //                获取zTree对象，可以调用zTree方法
            //                var treeObj = treeSelect.zTree('tree');
            //                console.log(treeObj);

            //                刷新树结构
            //                treeSelect.refresh();
        }
    });
}

/**
* 初始化员工树
* @param {*} elemId 
* @param {*} treeSelect 
*/
function initEmployeeTree(elemId, treeSelect) {
    treeSelect.render({
        elem: `#${elemId}`,
        data: 'employeeTree',
        type: 'get',
        placeholder: '选择员工',
        search: true,
    });
}

//table转ul函数
//    $.fn.setTable = function () {
//     var el=this;
//     this.start=function(){
//         $(el).find("ul").remove();
//         $(el).map(function () {
//             var list = '';
//             var name = [];
//             if ($(this).find("th").length == 0) {
//                 name = false;
//             } else {
//                 $(this).find("th").map(function () {
//                     name.push($(this).html());
//                 });
//             }
//             $(this).find("tbody tr").map(function () {
//                 var ul = '<ul>';
//                 $(this).find("td").map(function (index, item) {
//                     if(name) {
//                         ul += '<li>' + name[index] + ":&nbsp;" + $(this).html() + '</li>';
//                     }else{
//                         ul += '<li>' +"&nbsp;" + $(this).html() + '</li>';
//                     }
//                 });
//                 ul += '</ul>';
//                 list += ul;
//             });
//             $(this).find("table").hide();
//             $(this).append(list);
//         })
//     }
//     var _this=this;
//    $(window).resize(function(){
//         if($(window).width()<767){
//            _this.start();
//            }else{
//             $(el).find("table").show();
//             $(el).find("ul").hide();
//         }
//     });
//     if($(window).width()<767){
//         _this.start();
//     }
// };

//显示描述
function show_shopm(t) {
    var row = $(t).attr('data-d'); //获取显示内容
    //小tips
    layer.tips(row, t, {
        tips: [2, '#3595CC'],
        time: 4000
    })
}

// /**
//  * 提交URL
//  * 原数据
//  * layui.form
//  * formId
//  * table实例 
//  **/
// function openMain(url, record, form, formId, tableIns, tableName) {
//     if (record && typeof record == 'object') {
//         form.val(formId, record);//如果已有数据则填充表单;
//     }
//     var btn = ['确定', '取消'];
//     if (!url) {
//         btn = ['关闭'];
//     }
//     layer.open({
//         type: 1,
//         area: ['100%', '100%'],
//         btn: btn,
//         content: $("#window"),
//         yes: function (index, layero) {
//             var submitID = 'form_submit_btn'
//                 , submit = layero.find('#' + submitID);
//             if (!url) {
//                 layer.close(index);//关闭弹出层
//                 $(`#${formId}`)[0].reset();
//                 form.render();//重置form
//             } else {
//                 form.on(`submit(${submitID})`, (data => {
//                     var params = data.field;
//                     params.tableName = tableName;
//                     if (!record) {
//                         delete params.id;
//                     }
//                     $.ajax({
//                         url: url,
//                         type: 'get',
//                         async: false,
//                         data: params,
//                         success: function (data, textStatus) {
//                             layer.msg(data.msg);
//                             layer.close(index);//关闭弹出层
//                             $(`#${formId}`)[0].reset();
//                             form.render();//重置form
//                             reloadTable(tableIns);
//                         }
//                     });
//                 }));
//                 submit.trigger('click');
//             }
//         },
//         btn2: function (index, layero) {
//             $(`#${formId}`)[0].reset();
//             form.render();//重置form
//         }, cancel: function (index, layero) {
//             $(`#${formId}`)[0].reset();
//             form.render();//重置form
//         }
//     });
// };

/**
 * 打开保存弹窗
 */
function savePanel(url, record, tableIns, tableName) {
    var btn = ['确定', '取消'];
    if (!url) {
        btn = ['关闭'];
    }
    layer.open({
        type: 2
        , title: 'save'
        , area: ['100%', '100%']
        , btn: btn
        , content: 'savePanel'
        , success: (layero, index) => {
            //找到它的子窗口的body
            var body = layer.getChildFrame('body', index);  //巧妙的地方在这里哦
            let oldRecord = record ? JSON.stringify(record) : "";
            body.contents().find("#oldRecord").val(oldRecord);
        }
        , yes: function (index, layero) {
            //找到它的子窗口的body
            var body = layer.getChildFrame('body', index);  //巧妙的地方在这里哦
            var submitID = 'form_submit_btn'
                , submit = body.contents().find('#' + submitID);
            console.log('iframeName:==>',layero.find('iframe')[0]['name']);
            var iframeWin = window[layero.find('iframe')[0]['name']]; //得到iframe页的窗口对象，执行iframe页的方法
            var iFrameLayUi = iframeWin.layui;
            var iFrameForm = iFrameLayUi.form;
            console.log(iframeWin.find(`#myForm`));
            if (!url) {
                layer.close(index);//关闭弹出层
                body.contents().find(`#myForm`)[0].reset();
                iFrameForm.render();//重置form
            } else {
                iFrameForm.on(`submit(form_submit_btn)`, (data => {
                    var params = data.field;
                    params.tableName = tableName;
                    if (!record) {
                        delete params.id;
                    }
                    console.log(params);
                    $.ajax({
                        url: url,
                        type: 'get',
                        async: false,
                        data: params,
                        success: function (data, textStatus) {
                            layer.msg(data.msg);
                            layer.close(index);//关闭弹出层
                            body.contents().find(`#myForm`)[0].reset();
                            iFrameForm.render();//重置form
                            reloadTable(tableIns);
                        }
                    });
                }));
                submit.trigger('click');
            }
        },
        btn2: function (index, layero) {
            //找到它的子窗口的body
            var body = layer.getChildFrame('body', index);  //巧妙的地方在这里哦
            // body.contents().find(`#${formId}`)[0].reset();
            // // $(`#${formId}`)[0].reset();
            // form.render();//重置form
        }, cancel: function (index, layero) {
            //找到它的子窗口的body
            var body = layer.getChildFrame('body', index);  //巧妙的地方在这里哦
            // body.contents().find(`#${formId}`)[0].reset();
            // // $(`#${formId}`)[0].reset();
            // form.render();//重置form
        }
    })
}

/**
 * 按名称设置值
 * @param {*} name 
 * @param {*} value 
 * @returns 
 */
function setValueByName(name, value) {
    var a = jQuery(`[name=${name}]`);
    if (!a || a.length == 0) return;
    let tag = jQuery(`[name=${name}]`)[0].tagName;
    switch (tag) {
        case 'INPUT':
            if (value) {
                jQuery(`[name=${name}]`).val(value);
            } else {
                return jQuery(`[name=${name}]`).val();
            }
            break;
        case 'SELECT':
            if (value) {
                let filter = jQuery(`[name=${name}]`).attr('lay-filter');
                jQuery(`[name=${name}]`).val(value);
                filter && layui.event('form', 'select(' + filter + ')', { elem: jQuery(`[name=${name}]`), value: value });//触发该标签的select事件
            } else {
                return jQuery(`[name=${name}]`).val();
            }
            break;
        default:
            if (value) {
                jQuery(`[name=${name}]`).val(value);
            } else {
                return jQuery(`[name=${name}]`).val();
            }
            break;
    }
}

/**
 * 加载表单数据
 * @param {*} form 
 */
function formLoadData(form) {
    var oldRecord = jQuery("#oldRecord").val();
    if (oldRecord) {
        oldRecord = JSON.parse(oldRecord);
        try {
            for (const key in oldRecord) {
                if (Object.hasOwnProperty.call(oldRecord, key)) {
                    const value = oldRecord[key];
                    setValueByName(key, value);
                }
            }
            form.render();
        } catch (error) {
            console.error(error);
        };
    }
}

function reloadTable(tableIns) {
    var page = tableIns.page;
    if (page) {
        tableIns.reload({
            page: {
                curr: 1
            }
        })
    } else {
        tableIns.reload();
    }
}

function baseDel(url, id, tableIns, tableName) {
    layer.confirm(`是否删除?`, function (index) {
        $.ajax({
            url: url,
            type: 'get',
            async: false,
            data: { id: id, tableName: tableName },
            success: function (data, textStatus) {
                layer.msg(data.msg);
                reloadTable(tableIns);
            }
        })
        layer.close(index);
    });
}