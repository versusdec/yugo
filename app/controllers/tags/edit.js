define(
    ["microcore", "mst!/tags/edit", "app/modules/notify"],
    function (mc, view, notify
    ) {
        let item = {};

        function field_error(field) {
            $(field).addClass('error')
            setTimeout(() => {
                $(field).removeClass('error')
            }, 3000)
            return false
        }

        mc.events.on('sys:page.init:tags/edit', () => {
            $('button').on('click', (e) => {
                let type = e.target.dataset.type;
                item.name = $('input[name=name]').val();
                if (!item.name.length) {
                    return field_error('input[name=name]', 0)
                }

                mc.api.call('tags.create', item).then((res) => {
                    if (Number(res)>0) {
                        notify('Тэг создан', 'Тэг "' + item.name + '" успешно создан')
                        mc.router.go('/tags/')
                    } else {
                        notify('Тэг не создан', 'Ошибка при создании ' + item.name)
                    }
                })
            })
        });


        return async function (params) {
            let title = 'Создать тэг';

            if (params.id === 'new') {
                document.title = "Создание | Тэги | Yugo Platform";
                item = {};
            } else {
                mc.router.go('/tags/')
            }
            let data = {
                item: item,
                id: params.id
            };

            data.title = title;

            return view(data);
        }
    });