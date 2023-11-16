define(['microcore', 'mst!dashboard/admin/categories/item'], function (mc, item_view) {

  return async function ($scope, $params) {
    let limit = 10;

    mc.api.call("categories.stats", {
      limit: limit
    }).then(async function (categories) {
      if (categories && categories.items && categories.items.length) {
        $($scope).find('tbody').html('');
        for (let i in categories.items) {
          let item = categories.items[i];

          $($scope).find('tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет категорий")
      }

    })
  }
});