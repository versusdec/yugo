define(['microcore', 'mst!phones/upload', "/app/modules/notify", "app/modules/suggests"],
    function (mc, view, notify) {
        let data = {};

        function field_error(field) {
            $(field).addClass('error')
            setTimeout(() => {
                $(field).removeClass('error')
            }, 3000)
            return false
        }

        mc.events.on('phones.upload.file',  async (files) => {
            data.files = []
            for (let i in files) {
                if (files[i].path) {
                    data.files.push(files[i].path);
                }
            }
        });

        mc.events.on('phones.upload',  async () => {
            data.phones = $('textarea#phones').val();

            if ((data.files && data.files.length) || data.phones.length) {
                let stats = await mc.api.call("phones.upload", data);
                notify('Номера загружены', "\nЗагружено всего: " + stats.total + " \n Добавлено: " + stats.added)
                $('div.upload[handler]').outerHTML = view()
            } else {
                notify('Нет номеров для отгрузки')
            }

        })

        return async ($scope, $params) => {}
    });