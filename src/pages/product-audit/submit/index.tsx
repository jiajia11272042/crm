import React, { useState, useEffect } from "react";
import { Form, Input, Select, InputNumber, Button, message, Card, Row, Col } from "antd";
import { SaveOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "umi";
import { getCategories, createProduct, updateProduct } from "@/services/ant-design-pro/api";

// 模拟 Google Play 行业分类
const industryOptions = [
  { value: "GAME_ACTION", label: "游戏 - 动作" },
  { value: "GAME_ADVENTURE", label: "游戏 - 冒险" },
  { value: "GAME_ARCADE", label: "游戏 - 街机" },
  { value: "GAME_BOARD", label: "游戏 - 桌面" },
  { value: "GAME_CARD", label: "游戏 - 卡牌" },
  { value: "GAME_CASUAL", label: "游戏 - 休闲" },
  { value: "GAME_EDUCATIONAL", label: "游戏 - 教育" },
  { value: "GAME_MUSIC", label: "游戏 - 音乐" },
  { value: "GAME_PUZZLE", label: "游戏 - 益智" },
  { value: "GAME_RACING", label: "游戏 - 竞速" },
  { value: "GAME_ROLE_PLAYING", label: "游戏 - 角色扮演" },
  { value: "GAME_SIMULATION", label: "游戏 - 模拟" },
  { value: "GAME_SPORTS", label: "游戏 - 体育" },
  { value: "GAME_STRATEGY", label: "游戏 - 策略" },
  { value: "APP_BUSINESS", label: "应用 - 商务" },
  { value: "APP_EDUCATION", label: "应用 - 教育" },
  { value: "APP_ENTERTAINMENT", label: "应用 - 娱乐" },
  { value: "APP_FINANCE", label: "应用 - 金融" },
  { value: "APP_HEALTH_AND_FITNESS", label: "应用 - 健康与健身" },
  { value: "APP_LIFESTYLE", label: "应用 - 生活方式" }
];

// 模拟国家代码及中文名
const countryOptions = [
  { value: "CN", label: "中国" },
  { value: "US", label: "美国" },
  { value: "JP", label: "日本" },
  { value: "KR", label: "韩国" },
  { value: "GB", label: "英国" },
  { value: "DE", label: "德国" },
  { value: "FR", label: "法国" },
  { value: "IN", label: "印度" },
  { value: "RU", label: "俄罗斯" },
  { value: "BR", label: "巴西" }
];

// 上架状态选项
const shelfStatusOptions = [
  { value: "GA", label: "GA 在架" },
  { value: "GP", label: "GP 在架" },
  { value: "BOTH", label: "均在架" }
];

// 结算方式选项
const settlementOptions = [
  { value: "CPS", label: "CPS" },
  { value: "CPA", label: "CPA" },
  { value: "CPE", label: "CPE" },
  { value: "CPP", label: "CPP" }
];

const ProductSubmit = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const editProduct = (location.state as any)?.product;
  const isEdit = !!editProduct;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.code === 200 && res.data) {
          const options = res.data.map((cat: any) => ({
            value: cat.id,
            label: cat.nameEn ? `${cat.name} - ${cat.nameEn}` : cat.name,
          }));
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editProduct) {
      form.setFieldsValue({
        ...editProduct,
        targetCountries: editProduct.targetCountries ? editProduct.targetCountries.split(',') : [],
      });
    }
  }, [editProduct], form);

  const handleSave = async () => {
    try {
      setLoading(true);
      await form.validateFields(['packageName']);
      const values = form.getFieldsValue(true);
      const data = {
        ...values,
        targetCountries: values.targetCountries ? values.targetCountries.join(',') : '',
      };

      let res;
      if (isEdit) {
        res = await updateProduct(editProduct.id, data);
      } else {
        res = await createProduct(data);
      }

      if (res.code === 200) {
        message.success('暂存成功');
        navigate('/product-audit/list');
      } else {
        message.error(res.msg || '暂存失败');
      }
    } catch (error) {
      message.error('暂存失败，请输入包名');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const data = {
        ...values,
        targetCountries: values.targetCountries ? values.targetCountries.join(',') : '',
      };

      let res;
      if (isEdit) {
        res = await updateProduct(editProduct.id, data);
      } else {
        res = await createProduct(data);
      }

      if (res.code === 200) {
        message.success(isEdit ? '更新成功' : '提交成功');
        form.resetFields();
        navigate('/product-audit/list');
      } else {
        message.error(res.msg || (isEdit ? '更新失败' : '提交失败'));
      }
    } catch (error) {
      message.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{isEdit ? '产品编辑' : '产品提交'}</h1>
      <Card style={{ marginTop: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="packageName" label="包名" rules={[{ required: true, message: "请输入包名" }]}>
                <Input placeholder="请输入包名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: "请选择分类" }]}>
                <Select placeholder="请选择分类" options={categoryOptions} showSearch filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="developer" label="开发者名称" rules={[{ required: true, message: "请输入开发者名称" }]}>
                <Input placeholder="请输入开发者名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="packageSize" label="包体大小" rules={[{ required: true, message: "请输入包体大小" }]}>
                <Input placeholder="请输入包体大小" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shelfStatus" label="上架状态" rules={[{ required: true, message: "请选择上架状态" }]}>
                <Select placeholder="请选择上架状态" options={shelfStatusOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="settlementMethod" label="结算方式" rules={[{ required: true, message: "请选择结算方式" }]}>
                <Select placeholder="请选择结算方式" options={settlementOptions} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gaLink" label="GA 链接" dependencies={["shelfStatus"]} rules={[{ validator: (_, value, callback) => { const shelfStatus = form.getFieldValue("shelfStatus"); if ((shelfStatus === "GA" || shelfStatus === "BOTH") && !value) { callback("请输入 GA 链接"); } else { callback(); } } }]}>
                <Input placeholder="请输入 GA 链接" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gpLink" label="GP 链接" dependencies={["shelfStatus"]} rules={[{ validator: (_, value, callback) => { const shelfStatus = form.getFieldValue("shelfStatus"); if ((shelfStatus === "GP" || shelfStatus === "BOTH") && !value) { callback("请输入 GP 链接"); } else { callback(); } } }]}>
                <Input placeholder="请输入 GP 链接" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gpRating" label="GP 评分" rules={[{ required: true, message: "请输入 GP 评分" }, { type: "number", min: 0, max: 5, message: "评分范围 0-5" }]}>
                <InputNumber min={0} max={5} step={0.1} placeholder="0-5" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="attributionWindow" label="归因窗口期" rules={[{ required: true, message: "请输入归因窗口期" }, { type: "number", min: 1, message: "请输入正整数" }]}>
                <InputNumber min={1} placeholder="天数" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="targetCountries" label="投放目标国家" rules={[{ required: true, message: "请选择投放目标国家" }]}>
                <Select mode="multiple" placeholder="请选择投放目标国家" options={countryOptions} />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <Button type="default" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
              暂存
            </Button>
            <Button type="primary" icon={<CheckOutlined />} htmlType="submit" loading={loading}>
              保存&提审
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProductSubmit;
