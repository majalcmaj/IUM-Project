import React, {Component} from 'react';
import {connect} from 'react-redux';
import {StyleSheet, Text, TouchableHighlight, View} from "react-native";
import {createProduct} from '../actions/ProductActions';
import t from "tcomb-form-native";
import NavigateToProductAndForgetCurrent from "../actions/navigation/NavigateToProductAndForgetCurrent";

const Form = t.form.Form;

const NameType = t.refinement(t.String, (text) => {
    return text && text.length > 0;
});

const Product = t.struct({
    name: NameType,
    store: t.String,
    price: t.Number,
});

const options = {
    auto: "placeholders",
    fields: {
        name: {error: "Name cannot be empty"},
        store: {},
        price: {},
    }
};

class CreateProductScreen extends Component {

    constructor(props) {
        super(props);
        this.createProduct = this.createProduct.bind(this);
    }

    createProduct() {
        const formContent = this.refs.form.getValue();
        if (formContent) {
            const {navigation} = this.props;
            this.props.createProduct(formContent, (product) => navigation.dispatch(
                NavigateToProductAndForgetCurrent("ProductScreen",
                    {product, refresh: this.props.navigation.state.params.refresh})
            ));
        }
    }

    render() {

        return (
            <View style={styles.formContainer}>
                <Form
                    ref="form"
                    type={Product}
                    value={this.props.currentProduct}/>
                <TouchableHighlight style={styles.button} onPress={this.createProduct} underlayColor='#99d9f4'>
                    <Text style={styles.buttonText}>Create</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

export default connect(null, {createProduct})(CreateProductScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    formContainer: {
        width: "100%",
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
    },
    title: {
        fontSize: 30,
        alignSelf: 'center',
        marginBottom: 30
    },
    error: {
        fontSize: 15,
        alignSelf: 'center',
        marginBottom: 30,
        color: "red"
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
    },
    button: {
        height: 36,
        backgroundColor: '#48BBEC',
        borderColor: '#48BBEC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
        justifyContent: 'center'
    }
});

