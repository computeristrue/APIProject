layui.define(function (exports) {
    var layer = layui.layer;
    exports('myUtils', {
        relObj: function (objIds) {
            var form = layui.form;
            var dictIds = [];
            for (var key in objIds) {
                var objId = objIds[key];
                var me = $(`#${objId}`);
                var dictId = me.attr('dict');
                dictIds.push(`${objId}&${dictId}`);
            };
            $.ajax({
                url: '/dict/searchDict',
                type: 'get',
                async: false,
                data: {dictIds:dictIds.join(',')},
                success: function (data, textStatus) {
                    for (var key in data) {
                        var selObj = $(`#${key}`);
                        var dicts = data[key];
                        for (var id in dicts) {
                            var name = dicts[id];
                            selObj.append(`<option value = '${id}'>${name}</option>`);
                        }
                    }
                    form.render('select');
                }
            });
        }
    })
});