import React from 'react';
import { Card } from 'antd';

interface FamilyNode {
  name: string;
  children?: FamilyNode[];
  isSon?: boolean;
  isGrandson?: boolean;
}

const familyData: FamilyNode = {
  name: '爷爷 奶奶',
  children: [
    {
      name: '老大：大儿子',
      isSon: true,
      children: [
        { name: '孙子', isGrandson: true },
        { name: '孙女', isGrandson: true },
      ],
    },
    {
      name: '老二：二儿子',
      isSon: true,
      children: [
        { name: '孙子', isGrandson: true },
        { name: '孙女', isGrandson: true },
      ],
    },
    {
      name: '老三：三儿子',
      isSon: true,
      children: [
        { name: '孙子', isGrandson: true },
      ],
    },
    {
      name: '老四：四儿子',
      isSon: true,
      children: [
        { name: '孙子', isGrandson: true },
        { name: '孙女', isGrandson: true },
      ],
    },
    {
      name: '老五：五儿子',
      isSon: true,
      children: [
        { name: '孙女', isGrandson: true },
        { name: '孙女', isGrandson: true },
      ],
    },
    {
      name: '老六：大女儿',
      isSon: false,
      children: [
        { name: '孙女', isGrandson: true },
      ],
    },
  ],
};

const TreeNode: React.FC<{ node: FamilyNode; level?: number }> = ({ node, level = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 8px',
      }}
    >
      <div
        style={{
          padding: '12px 20px',
          borderRadius: '8px',
          background: level === 0 ? '#1890ff' : node.isSon ? '#52c41a' : '#eb2f96',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: level === 0 ? '16px' : '14px',
          minWidth: '100px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        {node.name}
        {level > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: node.isGrandson ? '#faad14' : node.isSon ? '#52c41a' : '#eb2f96',
              border: '2px solid #fff',
            }}
          />
        )}
      </div>
      {hasChildren && (
        <>
          <div
            style={{
              width: '2px',
              height: '30px',
              background: '#d9d9d9',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {node.children!.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  height: '2px',
                  background: '#d9d9d9',
                  left: `calc(50% - ${(node.children!.length - 1) * 60}px)`,
                  width: `${(node.children!.length - 1) * 120}px`,
                }}
              />
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              {node.children!.map((child, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '2px',
                      height: '30px',
                      background: '#d9d9d9',
                    }}
                  />
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FamilyTree: React.FC = () => {
  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card
        title="家族树状图"
        style={{ marginBottom: 16 }}
      >
        <div style={{ marginBottom: 16, padding: '16px', background: '#f6ffed', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, color: '#389e0d' }}>家族成员说明：</h3>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#595959' }}>
            <li>爷爷奶奶是家族的根节点</li>
            <li>共有6个孩子：5个儿子，1个女儿</li>
            <li>大儿子、二儿子、四儿子各有一儿一女</li>
            <li>三儿子有一个儿子</li>
            <li>五儿子有两个女儿</li>
            <li>大女儿有一个女儿</li>
          </ul>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 20px',
            overflowX: 'auto',
          }}
        >
          <TreeNode node={familyData} />
        </div>
      </Card>

      <Card title="家族成员统计">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '16px' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: '#e6f7ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>6</div>
            <div style={{ color: '#595959' }}>子女数量</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f6ffed', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>5</div>
            <div style={{ color: '#595959' }}>儿子数量</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#fff0f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#eb2f96' }}>1</div>
            <div style={{ color: '#595959' }}>女儿数量</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#fffbe6', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>9</div>
            <div style={{ color: '#595959' }}>孙辈数量</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FamilyTree;
