define(['microcore', 'mst!dashboard/components/support/item'], function (mc, item_view) {

  return async function ($scope, $params) {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("support.list", {
      limit: limit,
      offset: (page - 1) * limit
    }).then(async function (tickets) {
      let profile =  mc.auth.get();
      if (tickets && tickets.items && tickets.items.length) {
        $($scope).find('.loader').remove();
        $($scope).find('table tbody').html('');
        for (let i in tickets.items) {
          let item = tickets.items[i];
          item.profile = profile;

          $($scope).find('table tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет обращений")
      }

      mc.events.push('system:pagination.update', {
        total: tickets.total,
        limit: tickets.limit,
        current: page
      })
    })
  }
});