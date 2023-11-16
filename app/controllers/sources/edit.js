define(
    ["microcore", "mst!/sources/edit", "app/modules/notify"],
    function (mc, view, notify
    ) {
        let item = {}

        mc.events.on('sys:page.init:sources/edit', () => {
            $('button').on('click', (e) => {
                let type = e.target.dataset.type
                item.name = $('input[name=name]').val()

                mc.api.call('sources.' + type, item).then((res) => {
                    switch (type) {
                        case 'create':
                            notify('Источник создан', 'Источник "'+item.name+'" успешно создан')
                            break;
                        case 'update':
                            if (res) {
                                notify('Источник обновлен', 'Источник #'+item.id+' успешно обновлен')
                            } else {
                                notify('Источник не изменился', 'Источник #'+item.id+' не был изменен')
                            }

                            break;
                    }

                    mc.router.go('/sources/')
                })
            })
        })


        return async function (params) {
            let title = 'Создать источник'

            if (params.id == 'new') {
                document.title = "Создание | Источника | Yugo Platform";
            } else {
                document.title = "Редактирование | Источника | Yugo Platform";
                item = await mc.api.call('sources.get', {id: params.id})
                title = 'Редактирование источника'
            }
            let data = {
                item: item,
                id: params.id
            }

            data.title = title

            return view(data);
        }
    });