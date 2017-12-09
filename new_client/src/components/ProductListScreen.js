import React, {Component} from 'react';
import {Button, Image, ScrollView, Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {delAccessToken, getAccessToken} from "../helpers/AccessToken";
import resetNavigationAction from '../actions/navigation/ResetAction';
import {connect} from 'react-redux';
import {getAllProducts} from '../actions/ProductActions';
import {startSynchronization} from "../actions/SyncActions";

const rightArrow = require('../../res/img/next.png');

class ProductListScreen extends Component {

    constructor(props) {
        super(props);
        this.navDispatch = this.props.navigation.dispatch;
        this.navigate = this.props.navigation.navigate;
        this.logOut = this.logOut.bind(this);
        this.getProductsList = this.getProductsList.bind(this);
    }

    getProductsList() {
        getAccessToken().then((token) => {
            if (!token) {
                this.navDispatch(resetNavigationAction("LoginScreen"));
            } else {
                this.props.getAllProducts();
            }
        });
    }

    componentWillMount() {
        this.getProductsList();
    }

    logOut() {
        delAccessToken();
        this.navDispatch(resetNavigationAction("LoginScreen"));
    }

    navToProduct(productId) {
        this.navigate("ProductScreen", {productId: productId, refresh: this.getProductsList});
    }

    productsList() {
        return this.props.products.products.map((product) => {
            return (
                <TouchableOpacity key={product._id} onPress={() => this.navToProduct(product._id)}>
                    <View style={styles.item}>
                        <View style={styles.prodInfo}>
                            <Text style={styles.itemTitle}>{product.name}</Text>
                            <Text style={styles.itemCount}>count: {product.amount}</Text>
                        </View>
                        <Image source={rightArrow} style={{alignSelf: "flex-end"}}/>
                    </View>
                </TouchableOpacity>
            )
        });
    }

    showSyncError() {
        if(this.props.sync.error) {
            return(<Text style={styles.error}>{this.props.sync.error}</Text>);
        }else {
            return null;
        }
    }

    render() {
        if (!this.props.products.products) {
            return <View style={styles.loadingContainer}><Text>Loading...</Text></View>
        } else {
            return (
                <View>
                    <Button
                        title="Synchronize" onPress={ this.props.startSynchronization } />
                    <Button
                        title="Add product" onPress={() => this.navigate("CreateProductScreen", {refresh: this.getProductsList})} />
                    <ScrollView>
                        {this.productsList()}
                    </ScrollView>
                    <Button
                        title="Logout" onPress={this.logOut}/>
                </View>
            );
        }

    }
}

function mapStateToProps(state) {
    return {
        products: state.products,
        sync: state.sync
    }
}

export default connect(mapStateToProps, {getAllProducts, startSynchronization})(ProductListScreen);

const styles = StyleSheet.create({
    loadingContainer: {
        width: "100%",
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 30,
        borderBottomColor: '#dddddd',
        borderBottomWidth: StyleSheet.hairlineWidth,
        backgroundColor: '#FFFFFF'
    },
    prodInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        color: "#555555",
        fontSize: 14,
        marginRight: 10
    },
    itemCount: {
        color: "#99bbdd"
    },
    error: {
        color: "#FF0000",
        fontSize: 14
    }
});