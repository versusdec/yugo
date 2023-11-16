define(['microcore', 'mst!dashboard/components/news/item'], function (mc, item_view) {
  return async function ($scope, $params) {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("news.list", {
      limit: 3
    }).then(async function (news) {
      if (news && news.items && news.items.length) {
        $($scope).find('.loader').remove()
        for (let i in news.items) {
          let item = news.items[i];

          $($scope).find('.list').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет новостей")
      }

      mc.events.push('system:pagination.update', {
        total: news.total,
        limit: news.limit,
        current: page
      })
    })
  }
});