import React, { useState } from "react";
import {
  Upload,
  Button,
  Layout,
  Typography,
  Image,
  message,
  Spin,
  Card,
  Row,
  Col,
} from "antd";
import {
  UploadOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [showDownload, setShowDownload] = useState(false);

  const checkImageStatus = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/status/${id}`);
      if (response.data.status === "completed") {
        const imageUrl = `http://localhost:3000/image/${id}`;
        setProcessedImage(imageUrl);
        setLoading(false);
        setShowDownload(true); // Show the download button when image is processed
        message.success("Image processed successfully!");
      } else {
        setTimeout(() => checkImageStatus(id), 2000);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      message.error("Error checking image status.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData
      );
      const { id } = response.data;
      setImageId(id);
      setTimeout(() => checkImageStatus(id), 2000);
    } catch (error) {
      setLoading(false);
      message.error("Error uploading image.");
      console.error(error);
    }
  };

  const beforeUpload = (file) => {
    setFile(file);
    setOriginalImage(URL.createObjectURL(file));
    return false; // Prevent automatic upload
  };

  const handleDownload = () => {
    if (processedImage) {
      fetch(processedImage)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = "processed_image.png";
          downloadLink.style.display = "none";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(downloadLink);
        })
        .catch(error => console.error("Error downloading image:", error));
    }
  };
  
  

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header style={{ background: "transparent", padding: "0 50px" }}>
        <Title
          style={{ color: "black", textAlign: "center", margin: "20px 0" }}
        >
          Background Removal App (Testing)
        </Title>
      </Header>
      <Content style={{ padding: "50px 50px" }}>
        <Row gutter={16} justify="center">
          <Col xs={24} md={12}>
            <Card
              title="Original Image"
              style={{
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                minHeight: "150px",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <Upload
                beforeUpload={beforeUpload}
                maxCount={1}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
              {originalImage && (
                <div style={{ marginTop: 20 }}>
                  <Image
                    src={originalImage}
                    alt="Original"
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Processed Image"
              style={{
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                minHeight: "150px",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              {loading ? (
                <Spin
                style={{marginBottom: 20}}
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              ) : (
                processedImage && (
                  <>
                    <div style={{ position: "relative" }}>
                      
                      {showDownload && (
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={handleDownload}
                          style={{marginBottom: 20}}
                        >
                          Download
                        </Button>
                      )}
                      <Image
                        src={processedImage}
                        alt="Processed"
                        style={{ maxWidth: "100%" }}
                      />
                    </div>
                  </>
                )
              )}
              {!processedImage && (
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  onClick={handleUpload}
                  style={{ width: "100%", marginBottom: 20 }}
                  disabled={!file || loading}
                >
                  Upload and Remove Background
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Background Removal App ©2024 Created by You
      </Footer>
    </Layout>
  );
};

export default App;
