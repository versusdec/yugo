define(["microcore", "mst!/news/item","mst!/news/components/news_item",], function (mc, view, news_view) {

  let id;

  mc.events.on('sys:page.init:news/item', () => {
    mc.api.call('news.get', {id: id}).then(async res => {
         if(res){
            $('#news-holder').html('').append(await news_view(res))
         } else{
             $('.loader').html('Произошла ошибка при загрузке новости. Попробуйте&nbsp;<a class="link hover" onclick="location.reload()">перезагрузить страницу</a>')
         }
    });

  });

  return async function (params) {
    document.title = "Новости | Botto Platform";
    id = parseInt(params.id);
    return view();
  }
});