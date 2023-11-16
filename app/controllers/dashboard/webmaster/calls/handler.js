define(['microcore', 'mst!dashboard/webmaster/calls/item'], function (mc, item_view) {

  return async function ($scope, $params) {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("calls.list", {
      limit: limit,
      offset: (page - 1) * limit,
      role: user.settings.role
    }).then(async function (leads) {
      if (leads && leads.items && leads.items.length) {
        $($scope).find('tbody').html('');
        console.log(leads);
        for (let i in leads.items) {
          let item = leads.items[i];

          $($scope).find('tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет лидов")
      }

      mc.events.push('system:pagination.update', {
        total: leads.total,
        limit: leads.limit,
        current: page
      })
    })
  }
});