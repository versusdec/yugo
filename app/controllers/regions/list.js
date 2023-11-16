define(
    ["microcore", "mst!/regions/list"],
    function (mc, view
) {
    return function (params) {
        document.title = "Регионы | Yugo Platform";
        let title = 'Регионы'

        return view({
            title: title
        });
    }
});