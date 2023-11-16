define(
    ["microcore", "mst!/users/list"],
    function (mc, view
) {
    return function (params) {
        document.title = "Пользователи | Yugo Platform";
        let title = 'Пользователи'

        switch (params.type) {
            case 'webmasters':
                title = 'Вебмастеры'
                break;
            case 'merchants':
                title = 'Рекламодатели'
                break;
        }

        return view({
            type: params.type,
            title: title
        });
    }
});