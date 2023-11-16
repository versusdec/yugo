define(
    ["microcore", "mst!/categories/edit", "mst!/categories/field", "app/modules/notify"],
    function (mc, view, field_view, notify
) {
    let item = {}

    function field_error(field, tab) {
        $('ul.tabs li a')[tab].click()
        $(field).addClass('error')
        setTimeout(() => {
            $(field).removeClass('error')
        }, 3000)
        return false
    }

    mc.events.on('sys:page.init:categories/edit', () => {
        $('button[data-type]').on('click', (e) => {
            let type = e.target.dataset.type;

            if (type === 'next') {
                let $next = $($('ul.tabs li.active')[0].nextElementSibling)
                $next.removeClass('disabled')
                return $next.find('a')[0].click()
            }

            item.name = $('input[name=name]').val();
            if (!item.name.length) {
                return field_error('[name=name]', 0)
            }
            item.fields = [];
            document.querySelectorAll('#category_fields tr[data-id]').forEach((el, i) => {
               item.fields.push(el.dataset.id);
            });

            mc.api.call('categories.' + type, item).then((res) => {
                switch (type) {
                    case 'create':
                        notify('Категория создана', 'Категория "'+item.name+'" успешно создана')
                        break;
                    case 'update':
                        if (res) {
                            notify('Категория обновлена', 'Категория #'+item.id+' успешно обновлена')
                        } else {
                            notify('Категория не изменилась', 'Категория #'+item.id+' не была изменена')
                        }

                        break;
                }

                mc.router.go('/categories/')
            })
        })
    })


    return async function (params) {
        let title = 'Создать категорию'

        if (params.id == 'new') {
            document.title = "Создание | Категории | Yugo Platform";
            item = {};
        } else {
            document.title = "Редактирование | Категории | Yugo Platform";
            item = await mc.api.call('categories.get', {id: params.id})
            title = 'Редактирование категории'
        }

        let fields = [], fields_idx = [], _fields = await mc.api.call('fields.list', {limit: 1000});
        if (_fields && _fields.items && _fields.items.length) {
            for (let field of _fields.items) {
                fields_idx[field.id] = field;
                fields.push({
                    option: field.label,
                    value: field.id
                });
            }
        }

        let data = {
            fields: fields,
            item: item,
            id: params.id
        }

        data.title = title;

        data.field_change = async (field) => {
            if (!$('#category_fields tr[data-id="'+field.value+'"]').length && field.value.length) {
                $('#category_fields tbody').append(await field_view(fields_idx[field.value]));
            }
            $(field.id).find('span[data-value]')[0].dataset.value = '';
            $(field.id).find('span[data-value]')[0].innerText = '';
        };

        return view(data);
    }
});