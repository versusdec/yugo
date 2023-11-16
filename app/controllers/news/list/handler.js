define([
    'microcore',
    'mst!news/list/item',
    "/app/modules/confirm",
    "/app/modules/notify"],
    function (mc, item_view, confirm, notify) {

  mc.events.on('news.remove', (id) => {
    confirm('Удалить новость?', '#'+id, () => {
      mc.api.call('news.remove', {id: id}).then(res => {
        if (res) {
          notify('Новость удалена', 'Новость #"' + id + '" успешно удалена');
          mc.router.go('/news/');
        } else
          notify('Произошла ошибка')
      })
    })
  });

  return async function ($scope, $params) {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("news.list", {
      limit: limit,
      offset: (page - 1) * limit
    }).then(async function (news) {
      if (news.items && news.items.length) {
        news.total > limit ? $('.pagination-wrapper').css('display', 'block') : void 0;
        $('.loader').remove()
        for (let i in news.items) {
          let item = news.items[i];
          item.role = user.settings.role;
          $($scope).find('.list').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет новостей")
      }

      mc.events.push('system:pagination.update', {
        id: 'news',
        total: news.total,
        limit: news.limit,
        current: page
      })
    })
  }
});