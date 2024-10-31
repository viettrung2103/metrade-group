import { Nav } from "react-bootstrap";
import cartIcon from "../assets/cart.png";
import style from '../Styles/CartMenu.module.css';
import { useAuthContext } from "../hooks/useAuthContext";

const ProfileMenu = () => {
    const { cartCount } = useAuthContext();

    return (
        <Nav.Link href="/cart-detail">
            <div className={`${style.cart}`}>
                <img className={`${style.cartIcon}`} src={cartIcon} alt="cart" />
                <span className={`${style.cartCount}`}>
                    {cartCount > 0 ? cartCount : ''}
                </span>
            </div>
        </Nav.Link>
    );
};

export default ProfileMenu;