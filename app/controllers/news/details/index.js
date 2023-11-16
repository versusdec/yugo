define(["microcore", "mst!/news/details/item"], function (mc, view) {

  let id;

  mc.events.on('sys:page.init:news/details/index', () => {

  });

  return async function (params) {
    document.title = "Новости | Yugo Platform";
    id = parseInt(params.id);
    let item = await mc.api.call('news.get', {id: id})
    return view(item);
  }
});