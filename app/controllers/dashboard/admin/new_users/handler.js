define(['microcore', 'mst!dashboard/admin/new_users/item'], function (mc, item_view) {

  return async function ($scope, $params) {
    let limit = 10;
    mc.api.call("users.list", {
      limit: limit,
      role: $params.role
    }).then(async function (users) {
      if (users && users.items && users.items.length) {
        $($scope).find('tbody').html('');
        for (let i in users.items) {
          let item = users.items[i];

          $($scope).find('tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет пользователей")
      }
    })
  }
});