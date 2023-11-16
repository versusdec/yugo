define(['microcore', 'mst!leads/list/upload', "mst!leads/list/preview", "/app/modules/notify", "app/modules/suggests"],
    function (mc, view, preview, notify) {
    let data = {separator: ',', headed: false};

    function field_error(field) {
        $(field).addClass('error')
        setTimeout(() => {
            $(field).removeClass('error')
        }, 3000)
        return false
    }

    async function suggest(method, params, cb) {
        let data = await mc.api.call(method, params)

        let items = []

        for (let i in data.items) {
            let item = data.items[i]
            if (typeof cb == 'function') {
                items.push(cb(item))
            } else {
                items.push({
                    option: item.name,
                    value: item.id
                })
            }

        }

        return items
    }

    async function loadPreviews(){
        $('#previews').html('');
        let previews = await mc.api.call("leads.preview", {files: data.files, separator: data.separator, headed: data.headed});
        if (previews && data.category){
            for (let file in previews){
                let pre = previews[file], cols = [], cols_count = 0;
                if (pre && pre.length){
                    cols_count = pre[0].length;
                    pre[0].forEach((v, i) => {
                        cols.push({fields: data.category.fields2, col: i});
                    });
                    pre.forEach((v, i) => {
                        if (v) {
                            if (v.length < cols_count) {
                                for (let j = v.length; j < cols_count; j++) {
                                    v[j] = "";
                                }
                            }
                        } else {
                            notify('Произошла ошибка загрузки предпросмотра');
                            return;
                        }
                    });
                }
                $('#previews').append(await preview({
                    file: file,
                    cols: cols,
                    rows: pre
                }));
            }
        }
    }

    mc.events.on('leads.upload.file',  async (files) => {
        data.files = []
        for (let i in files) {
            if (files[i].path) {
                data.files.push(files[i].path);
            }
        }
        $('#upload').removeClass('hide');
        if (data.category){
            loadPreviews();
        }
    })

    mc.events.on('leads.upload.region.change', async (selected) => {
        data.region = selected.value
    })

    mc.events.on('leads.upload.category.change', async (selected) => {
        data.category = await mc.api.call('categories.get', {id: selected.value});
        if (data.category && data.category.fields){
            data.category.fields2 = [{option: "*Номер телефона", value: "phone" }];
            for (let field of data.category.fields){
                data.category.fields2.push({
                    option: field.label,
                    value: field.id
                })
            }
        }
        loadPreviews();
    })

    mc.events.on('leads.upload.source.change', async (selected) => {
        data.source = selected.value
    })

    mc.events.on('leads.upload.webmaster.change', async (selected) => {
        data.user_id = selected.value
    });

    mc.events.on('leads.upload.tag.change', async (selected) => {
        data.tag = selected.value
    });

    mc.events.on("leads.upload.preview.remove", async (span) => {
        let div = span.closest('.preview'), file = div.dataset.file, new_files = [];
        div.remove();
        for (let f of data.files){
            if (f !== file){
                new_files.push(f);
            }
        }
        data.files = new_files;
    });

    mc.events.on("leads.upload.separator.change", async () => {
        data.separator = $('#separator').val();
        loadPreviews();
    });

    mc.events.on("leads.upload.headed.change", async () => {
        data.headed = $('#headed')[0].checked;
        loadPreviews();
    });


    mc.events.on('leads.upload',  async () => {
        if (!data.category){
            return field_error('input[name="upload.category"]');
        }
        if (!data.region){
            return field_error('input[name="upload.region"]');
        }
        if (!data.source){
            return field_error('input[name="upload.source"]');
        }
        if (!(data.files && data.files.length)){
            $('.dropzone > input[type=file]')[0].click();
        }
        data.category = data.category.id;
        let files = data.files;
        data.files = [];
        for (let file of files){
            let matching = [], file_preview = $('.preview[data-file="'+file+'"]');
            $(file_preview).find('td[data-col]').forEach((td, i) => {
                let column = td.dataset.col, field = $(td).find('span[data-name=field]')[0].dataset.value;
                matching.push({column: column, field: field});
            });
            data.files.push({file: file, matching: matching});
        }
        let stats = await mc.api.call("leads.upload", data)
        data = {separator: $('#separator').val(), headed: $('#headed')[0].checked};

        notify('Лиды загружены', "\nЗагружено всего: "+stats.total+" \n Добавлено: " + stats.added)
        $('div.upload[handler]').outerHTML = view()
        $('#upload').addClass('hide')
    })

    return async ($scope, $params) => {}
});