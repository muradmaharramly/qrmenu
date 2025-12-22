import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import QRCode from 'qrcode';
import { Download, RefreshCw, QrCode as QrIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Link } from 'react-router-dom';
import { RxExternalLink } from 'react-icons/rx';

const MySwal = withReactContent(Swal);

const QRManager = () => {
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setQrData(data);
        generateQRImage(data.menu_url);
      }
    } catch (error) {
      console.error('QR kod yüklənmədi:', error);
    }
  };

  const generateQRImage = async (url) => {
    try {
      const qrImageData = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrImage(qrImageData);
    } catch (error) {
      console.error('QR şəkil yaradılmadı:', error);
    }
  };

  const generateNewQR = async () => {
    const result = await MySwal.fire({
      title: 'Yeni QR yaratmaq istədiyinizə əminsiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Bəli, yarat',
      cancelButtonText: 'İmtina et',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        content: 'swal-text',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      },
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const code = `QR-${Date.now()}`;
      const menuUrl = `https://qr-menyu.netlify.app/#/menu/${code}`;


      const { data, error } = await supabase
        .from('qr_codes')
        .insert([{ code, menu_url: menuUrl }])
        .select()
        .single();

      if (error) throw error;

      setQrData(data);
      generateQRImage(data.menu_url);

      // Yaradıldıqdan sonra info SweetAlert
      await MySwal.fire({
        title: 'Yeni QR yaradıldı!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          confirmButton: 'swal-confirm-btn'
        }
      });

    } catch (error) {
      console.error('Yeni QR yaradılmadı:', error);
      await MySwal.fire({
        title: 'Xəta baş verdi!',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-text',
          confirmButton: 'swal-confirm-btn'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `menu-qr-${Date.now()}.png`;
    link.href = qrImage;
    link.click();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>QR Kod İdarəetməsi</h2>
        <button 
          className="btn btn-primary" 
          onClick={generateNewQR}
          disabled={loading}
        >
          <RefreshCw size={20} />
          {loading ? 'Yaradılır...' : 'Yeni QR Yarat'}
        </button>
      </div>
      <div className="card-body">
        {qrImage ? (
          <div className="qr-container">
            <div className="qr-preview">
              <img src={qrImage} alt="Menu QR Code" />
            </div>
            <div className="qr-info">
              <h3>Aktiv QR Kod</h3>
              <p><strong>Kod:</strong> {qrData?.code}</p>
              <p><strong>URL:</strong><Link to={qrData?.menu_url}>{qrData?.menu_url} <RxExternalLink /></Link></p>
              <p><strong>Yaradılma tarixi:</strong> {new Date(qrData?.created_at).toLocaleString('az-AZ')}</p>
              
              <button className="btn btn-success" onClick={downloadQR}>
                <Download size={20} />
                QR Kodu Yüklə
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <QrIcon size={48} />
            <p>QR kod yoxdur. Yeni QR yaradın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRManager;
