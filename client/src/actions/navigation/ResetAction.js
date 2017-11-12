import { NavigationActions } from "react-navigation";

export default function navigateWithReset(routeName) {
    return NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({
                routeName: routeName
            })
        ]
    });
}