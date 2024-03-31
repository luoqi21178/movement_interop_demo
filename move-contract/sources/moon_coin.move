module call_evm_demo::moon_coin {
    use aptos_framework::movement_coin;
    use std::string::utf8;
    use aptos_framework::fungible_asset::{MintRef, TransferRef, BurnRef, Metadata};
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::object::Object;
    use aptos_framework::object;

    struct MoonCoin has key {
        evm_address: vector<u8>,
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
    }

    fun init_module(sender: &signer) {
        let (constructor_ref, evm_address)  = movement_coin::create_movement_coin(
            sender,
            utf8(b"Moon Coin"),
            utf8(b"MOON")
        );

        // Create mint/burn/transfer refs to allow creator to manage the fungible asset.
        let mint_ref = fungible_asset::generate_mint_ref(&constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(&constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(&constructor_ref);

        move_to(
            sender,
            MoonCoin { evm_address, mint_ref, transfer_ref, burn_ref }
        )
    }

    public entry fun mint(to: address, amount: u64) acquires MoonCoin {
        let moon_coin = borrow_global<MoonCoin>(@call_evm_demo);
        primary_fungible_store::mint(&moon_coin.mint_ref, to, amount);
    }

    #[view]
    fun get_evm_address(): vector<u8> acquires MoonCoin {
        borrow_global<MoonCoin>(@call_evm_demo).evm_address
    }

    #[view]
    /// Return the address of the managed fungible asset that's created when this module is deployed.
    public fun get_metadata(): Object<Metadata> acquires MoonCoin {
        let asset_address = object::create_object_address(&@call_evm_demo, get_evm_address());
        object::address_to_object<Metadata>(asset_address)
    }
}
