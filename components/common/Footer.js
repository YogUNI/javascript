import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">About Us</h5>
            <p>We provide high-quality perfume decants and full bottles. Experience luxury fragrances at affordable prices.</p>
            <div className="d-flex mt-3">
              <a href="https://instagram.com/yourstore" className="me-3 text-white">
                <FaInstagram size={24} />
              </a>
              <a href="https://wa.me/6281234567890" className="me-3 text-white">
                <FaWhatsapp size={24} />
              </a>
              <a href="mailto:info@yourstore.com" className="text-white">
                <FaEnvelope size={24} />
              </a>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-white">Home</Link></li>
              <li className="mb-2"><Link to="/products" className="text-decoration-none text-white">All Products</Link></li>
              <li className="mb-2"><Link to="/how-to-order" className="text-decoration-none text-white">How to Order</Link></li>
              <li className="mb-2"><Link to="/faq" className="text-decoration-none text-white">FAQ</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-decoration-none text-white">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                Jl. Parfum Wangi No. 123, Jakarta
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" />
                +62 812-3456-7890
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                info@yourstore.com
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="mt-4 mb-4" />
        
        <div className="row">
          <div className="col-md-12 text-center">
            <p className="mb-0">© {new Date().getFullYear()} Parfum Store. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;