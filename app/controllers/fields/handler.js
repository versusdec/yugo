define(['microcore', 'mst!fields/item', "/app/modules/confirm", "/app/modules/notify"], function (mc, item_view, confirm, notify) {

  mc.events.on('fields.remove', (field) => {
    confirm('Удалить поле?', field.name, () => {
      mc.api.call('fields.remove', {id: parseInt(field.id)}).then(res => {
        if (res) {
          notify('Поле удалено', 'Поле "' + field.name + '" успешно удалено');
          mc.router.go('/fields/')
        } else
          notify('Произошла ошибка', 'Поле используется')
      })
    })
  });

  return async ($scope, $params) => {
    let hash_params = mc.router.hash()
    let page = parseInt(hash_params.page) || 1
    let limit = parseInt(hash_params.limit) || 10

    let fields = await mc.api.call("fields.list", {
      limit: limit,
      offset: (page - 1) * limit
    })

    if (fields && fields.items && fields.items.length) {
      $($scope).find('table > tbody').html('')
      for (let i in fields.items) {
        let item = fields.items[i]
        $($scope).find('table > tbody').append(await item_view(item))
      }
    } else {
      $($scope).find('table > tbody .loader').text("нет полей")
    }

    mc.events.push('system:pagination.update', {
      id: 'fields',
      total: fields.total,
      limit: fields.limit,
      current: page
    })
  }
});