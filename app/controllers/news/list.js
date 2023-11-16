define(
    ["microcore", "mst!/news/list"],
    function (mc, view
) {
    return function (params) {
        document.title = "Новости | Botto Platform";

        return view({type: params.type, page: params.page?params.page:1});
    }
});