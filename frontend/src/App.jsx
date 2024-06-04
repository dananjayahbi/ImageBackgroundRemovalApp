import React, { useState } from "react";
import { Upload, Button, Layout, Typography, Image, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

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
        "http://localhost:3000/remove-bg",
        formData,
        {
          responseType: "blob",
        }
      );

      const imageUrl = URL.createObjectURL(new Blob([response.data]));
      setProcessedImage(imageUrl);
      setLoading(false);
      message.success("Image processed successfully!");
    } catch (error) {
      setLoading(false);
      message.error("Error processing image.");
      console.error(error);
    }
  };

  const beforeUpload = (file) => {
    setFile(file);
    return false; // Prevent automatic upload
  };

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header>
        <Title
          style={{ color: "white", textAlign: "center", margin: "20px 0" }}
        >
          Background Removal App
        </Title>
      </Header>
      <Content style={{ padding: "50px 50px" }}>
        <div
          style={{
            background: "#fff",
            padding: 24,
            minHeight: 280,
            textAlign: "center",
          }}
        >
          <Upload beforeUpload={beforeUpload} maxCount={1}>
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleUpload}
            style={{ marginTop: 20 }}
            disabled={!file}
          >
            Upload and Remove Background
          </Button>
          {loading && <Spin style={{ marginTop: 20 }} />}
          {processedImage && (
            <div style={{ marginTop: 20 }}>
              <Title level={4}>Processed Image</Title>
              <Image src={processedImage.imageUrl} alt="Processed" />
            </div>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Background Removal App ©2024 Created by You
      </Footer>
    </Layout>
  );
};

export default App;
