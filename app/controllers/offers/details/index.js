define(
  ["microcore", "mst!/offers/details/index", "app/modules/notify"],
  function (mc, view, notify
  ) {
    mc.events.on('sys:page.init:offers/details/index', () => {

    });

    return async function (params) {
      document.title = `${mc.i18n('offers.title')} | Yugo Platform`;
      let data = await mc.api.call('offers.get', {id: +params.id});
      console.log(data);
      data.profile = mc.auth.get();
      data.filter = mc.router.hash();
      return view(data);
    }
  });