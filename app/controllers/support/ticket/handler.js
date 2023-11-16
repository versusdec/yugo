define(['microcore', 'mst!support/ticket/item', "/app/modules/notify"],
  function (mc, item_view) {
    let id;

    mc.events.on('', async () => {

    });

    return async ($scope, $params) => {
      let hash_params = mc.router.hash();
      id = parseInt($params.id);

      //@todo pagination

      /*let answers = JSON.parse($params.answers);
      if (answers) {
        $($scope).find('.chat').html('');

        answers.forEach(async e => {
          $($scope).find('tbody').append(await item_view(e))
        })
      }*/
    }
  });