define(
    ["microcore", "mst!/fields/list"],
    function (mc, view
) {
    return function (params) {
        document.title = "Поля | Yugo Platform";
        let title = 'Поля';

        return view({
            title: title
        });
    }
});