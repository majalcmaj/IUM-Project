import { NavigationActions } from "react-navigation";

export default function (routeName, params) {
    return NavigationActions.reset({
        index: 1,
        actions: [
            NavigationActions.navigate({
                routeName: "ProductListScreen"
            }),
            NavigationActions.navigate({
                routeName: routeName,
                params: params
            })
        ]
    });
}