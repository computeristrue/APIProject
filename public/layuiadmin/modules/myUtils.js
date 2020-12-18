layui.define(function (exports) {
    var layer = layui.layer;
    function searchLink (link,objId,dictId,form){
        form.on(`select(${objId})`,(data)=>{
            var val = data.value;
            console.log(val);
            if(!val){
                return;
            }
            var linkObj = $(`#${link}`);
            linkObj.empty();
            $.ajax({
                url: '/dict/linkDict',
                type: 'get',
                async: false,
                data: {t:link.replace('_id',''),link:objId,linkId:val},
                success: function (data, textStatus) {
                    console.log(data);
                    for (var key in data) {
                        linkObj.append(`<option value = '${key}}'>${data[key]}</option>`);
                    }
                    form.render('select');
                }
            });
        })
    }
    exports('myUtils', {
        relObj: function (objIds) {
            var form = layui.form;
            var dictIds = [];
            for (var key in objIds) {
                var objId = objIds[key];
                var me = $(`#${objId}`);
                var dictId = me.attr('dict');
                var link = me.attr('link');
                if(link && false){//先不加查询条件了
                    searchLink(link,objId,dictId,form);
                }
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