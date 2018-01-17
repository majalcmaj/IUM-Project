import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Text, StyleSheet, View, TouchableHighlight, Alert} from "react-native";
import {getProduct, increaseProductCount, removeProduct, setAsCurrentProduct} from '../actions/ProductActions';
import ResetAction from "../actions/navigation/ResetAction";

class ProductScreen extends Component {
    componentWillMount() {
        const { productId } = this.props.navigation.state.params;
        this.props.getProduct(productId);
    }

    componentWillUnmount() {
        this.props.navigation.state.params.refresh();
    }

    removeProduct() {
        Alert.alert(
            'Remove',
            'Are you sure you want to remove this product?',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Yes', onPress: () => this.props.removeProduct(this.props.currentProduct, () => {
                    this.props.navigation.dispatch(ResetAction("ProductListScreen"))
                })}
            ],
            { cancelable: false }
        );
    }

    getDataRow(label, value) {
        return (<View style={styles.verticalRow}>
            <Text style={styles.label}>{label}</Text>
            <Text>{value}</Text>
        </View>);
    }

    render() {
        if (!this.props.currentProduct) {
            return (<Text>Loading...</Text>)
        } else {
            const product = this.props.currentProduct;
            return (
                <View style={styles.mainContainer}>
                    <View style={styles.dataContainer}>
                        {this.getDataRow("Name: ", product.name)}
                        {this.getDataRow("Store: ", product.store)}
                        {this.getDataRow("Price: ", product.price)}
                        {this.getDataRow("Amount: ", product.amount)}
                        <View style={styles.verticalRow}>
                            <TouchableHighlight style={styles.buttonInc}
                                                onPress={() => this.props.increaseProductCount(product, 1)}
                                                underlayColor='#99d9f4'>
                                <Text style={styles.buttonText}>+</Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={styles.buttonDec}
                                                disabled = {product.amount <= 0}
                                                onPress={() => this.props.increaseProductCount(product, -1)}
                                                underlayColor='#99d9f4'>
                                <Text style={styles.buttonText}>-</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                    <TouchableHighlight style={styles.buttonDelete} onPress={() => this.removeProduct() } underlayColor='#99d9f4'>
                        <Text style={styles.buttonText}>Remove</Text>
                    </TouchableHighlight>
                </View>
            );
        }
    }
}

function mapStateToProps(state) {
    return {
        currentProduct: state.products.currentProduct,
        updateNo: state.products.updateNo
    };
}

export default connect(mapStateToProps,
    {increaseProductCount, getProduct, removeProduct, setAsCurrentProduct})
(ProductScreen);

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'space-between'
    },
    dataContainer: {
        width: "100%",
        justifyContent: 'center',
        marginTop: 20,
        padding: 20,
    },
    verticalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
    },
    label: {
        fontSize: 16,
        color: '#48BBEC',
    },
    buttonText: {
        fontSize: 32,
        color: 'white',
        alignSelf: 'center'
    },
    buttonDec: {
        height: 40,
        backgroundColor: '#ff6644',
        borderColor: '#ff6644',
        borderWidth: 1,
        borderRadius: 4,
        margin: 3,
        width: "40%",
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    buttonInc: {
        height: 40,
        backgroundColor: '#44aa55',
        borderColor: '#44aa55',
        borderWidth: 1,
        borderRadius: 4,
        margin: 3,
        width: "40%",
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    buttonDelete: {
        height: 40,
        backgroundColor: '#cc0022',
        borderColor: '#cc0022',
        borderWidth: 1,
        borderRadius: 8,
        margin: 10,
        width: "80%",
        alignSelf: 'center',
        justifyContent: 'center'
    },
});

