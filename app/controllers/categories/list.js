define(
    ["microcore", "mst!/categories/list"],
    function (mc, view
) {
    return function (params) {
        document.title = "Категории | Yugo Platform";
        let title = 'Категории'

        return view({
            title: title
        });
    }
});