<template>
  <el-button plain @click="exportToWord">导出word</el-button>
  <div class="word-document" ref="wordContent">
    <table class="word-table">
      <colgroup>
        <col v-for="(width, index) in colWidths" :key="index" :style="{ width: width + '%' }">
      </colgroup>

      <thead>
      <!-- 标题行 -->
      <tr>
        <th colspan="18" class="table-title">
          <p>四川新为橡塑有限公司检测中心</p>
          <p>Sichuan Xinwei Rubber Co., LTD. Test Report Testing Center</p>
          <p class="title-bold">检 测 报 告</p>
          <p>Test Report</p>
        </th>
      </tr>

      <!-- 报告编号 -->
      <tr>
        <th colspan="18" class="report-number">
          报告编号Report No.：XWJC/TR-2024-1121-05
        </th>
      </tr>

      <!-- 样品信息行 -->
      <tr>
        <th colspan="4" class="table-header">
          <p>样品名称</p>
          <p>Sample Name</p>
        </th>
        <th colspan="5" class="table-data">66#胶</th>
        <th colspan="5" class="table-header">
          <p>样品编号</p>
          <p>Sample NO.</p>
        </th>
        <th colspan="4" class="table-data">2024-11-19-01</th>
      </tr>

      <!-- 检测信息行 -->
      <tr>
        <th colspan="4" class="table-header">
          <p>检测日期</p>
          <p>Test Date</p>
        </th>
        <th colspan="5" class="table-data">2024.11.21</th>
        <th colspan="5" class="table-header">
          <p>检测地点</p>
          <p>Test Spot</p>
        </th>
        <th colspan="4" class="table-data">物理检测室</th>
      </tr>
      </thead>

      <tbody>
      <!-- 环境条件 -->
      <tr>
        <td colspan="4" class="table-header">
          <p>环境条件</p>
          <p>Environmental Condition</p>
        </td>
        <td colspan="14" class="table-data">温度：23℃，湿度：60%</td>
      </tr>

      <!-- 仪器设备 -->
      <tr>
        <td colspan="4" class="table-header">
          <p>仪器设备</p>
          <p>Equipments</p>
        </td>
        <td colspan="14" class="table-data">
          <p>邵A硬度计/JSSB-058(有效期：2023.11.27~2024.11.26)</p>
          <p>高低温拉力机/JSSB-059（有效期：2024.4.20~2025.4.19）</p>
          <p>门尼黏度仪/JSSB-021（有效期：2023.10.26~2024.10.25）</p>
        </td>
      </tr>

      <!-- 检测结论 -->
      <tr>
        <td colspan="4" class="table-header">
          <p>检测结论</p>
          <p>Test Conclusion</p>
        </td>
        <td colspan="14" class="table-data">
          <p>☑合格 ☐不合格</p>
          <p>检测结果判定规则依据公司内部质量控制技术要求。</p>
        </td>
      </tr>

      <!-- 检测项目及结果标题 -->
      <tr>
        <td colspan="17" class="test-result-title">
          <p>检测项目及结果</p>
          <p>Test Item and Result</p>
        </td>
        <td rowspan="4">
          <p>结果判定</p>
          <p>Result Determination</p>
        </td>
      </tr>

      <!-- 检测项目表头 -->
      <tr>
        <td rowspan="3">
          <p>序号</p>
          <p>NO.</p>
        </td>
        <td class="table-header">
          <p>检测项目</p>
          <p>Test Item</p>
        </td>
        <td class="table-data">硬度（邵A）/Shore A</td>
        <td colspan="2" class="table-data">拉伸强度/MPa</td>
        <td colspan="2" class="table-data">断裂伸长率/%</td>
        <td colspan="3" class="table-data">100%定伸应力/MPa</td>
        <td class="table-data">300%定伸应力/MPa</td>
        <td colspan="2" class="table-data">门尼(母炼)/<br>ML(1+4)100℃</td>
        <td colspan="2" class="table-data">门尼(终炼)/<br>ML(1+4)100℃</td>
        <td colspan="2" class="table-data">密度/Mg/m<sup>3</sup></td>
      </tr>

      <!-- 技术要求 -->
      <tr>
        <td class="table-header">
          <p>技术要求</p>
          <p>Technical Requirement</p>
        </td>
        <td class="table-data">80~90</td>
        <td colspan="2" class="table-data">≥18</td>
        <td colspan="2" class="table-data">≥260</td>
        <td colspan="3" class="table-data">≥6</td>
        <td class="table-data"></td>
        <td colspan="2" class="table-data">≤95</td>
        <td colspan="2" class="table-data">≤82</td>
        <td colspan="2" class="table-data"></td>
      </tr>

      <!-- 检测方法 -->
      <tr>
        <td class="table-header">
          <p>检测方法</p>
          <p>Test Method</p>
        </td>
        <td class="table-data">GB/T 531.1-2008</td>
        <td colspan="2" class="table-data">GB/T 528-2009</td>
        <td colspan="2" class="table-data">GB/T 528-2009</td>
        <td colspan="3" class="table-data">GB/T 528-2009</td>
        <td class="table-data">GB/T 528-2009</td>
        <td colspan="2" class="table-data">GB/T 1232.1-2016</td>
        <td colspan="2" class="table-data">GB/T 1232.1-2016</td>
        <td colspan="2" class="table-data"></td>
      </tr>

      <!-- 检测数据行 -->
      <tr v-for="(row, index) in testData" :key="index">
        <td colspan="2" class="table-data">{{ row.id }}</td>
        <td class="table-data">{{ row.hardness }}</td>
        <td colspan="2" class="table-data">{{ row.strength }}</td>
        <td colspan="2" class="table-data">{{ row.elongation }}</td>
        <td colspan="3" class="table-data">{{ row.stress100 }}</td>
        <td class="table-data">{{ row.stress300 }}</td>
        <td colspan="2" class="table-data">{{ row.mooneyMother }}</td>
        <td colspan="2" class="table-data">{{ row.mooneyFinal }}</td>
        <td colspan="2" class="table-data">{{ row.density }}</td>
        <td class="table-data">{{ row.result }}</td>
      </tr>

      <!-- 备注 -->
      <tr>
        <td colspan="2" class="table-header">
          <p>备注</p>
          <p>Remark</p>
        </td>
        <td colspan="16" class="table-data">/</td>
      </tr>

      <!-- 签名行 -->
      <tr>
        <td colspan="2" class="table-header">
          <p>检测人</p>
          <p>Tested by</p>
        </td>
        <td colspan="4" class="table-data"></td>
        <td colspan="2" class="table-header">
          <p>复核人</p>
          <p>Checked by</p>
        </td>
        <td colspan="4" class="table-data"></td>
        <td colspan="4" class="table-header">
          <p>批准人</p>
          <p>Approved by</p>
        </td>
        <td colspan="2" class="table-data"></td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import JSZip from 'jszip'
import {saveAs} from 'file-saver'
import {Document, Paragraph, Packer, Table, TableRow, TableCell, WidthType, TextRun, HeadingLevel, AlignmentType} from 'docx'
import mammoth from "mammoth";

const wordContent = ref();

const colWidths = [4, 9, 9, 1, 7, 0, 8, 6, 1, 1, 9, 5, 4, 4, 5, 0, 9, 9];

const testData = [
  {
    id: 1,
    hardness: '83.6',
    strength: '19.8',
    elongation: '263',
    stress100: '7',
    stress300: '',
    mooneyMother: '80.2',
    mooneyFinal: '',
    density: '',
    result: '合格'
  },
  {
    id: 2,
    hardness: '',
    strength: '',
    elongation: '',
    stress100: '',
    stress300: '',
    mooneyMother: '',
    mooneyFinal: '',
    density: '',
    result: '合格'
  },
  {
    id: 3,
    hardness: '',
    strength: '',
    elongation: '',
    stress100: '',
    stress300: '',
    mooneyMother: '',
    mooneyFinal: '',
    density: '',
    result: '合格'
  },
  {
    id: 4,
    hardness: '',
    strength: '',
    elongation: '',
    stress100: '',
    stress300: '',
    mooneyMother: '',
    mooneyFinal: '',
    density: '',
    result: ''
  },
  {
    id: 5,
    hardness: '',
    strength: '',
    elongation: '',
    stress100: '',
    stress300: '',
    mooneyMother: '',
    mooneyFinal: '',
    density: '',
    result: ''
  },
  {
    id: 6,
    hardness: '',
    strength: '',
    elongation: '',
    stress100: '',
    stress300: '',
    mooneyMother: '',
    mooneyFinal: '',
    density: '',
    result: ''
  }
];

async function extractStyles(arrayBuffer) {
  // 1. 使用 JSZip 解压
  const zip = await JSZip.loadAsync(arrayBuffer)

  // 2. 读取样式文件
  const stylesXml = await zip.file('word/styles.xml').async('text')

  // 3. 解析 XML（使用浏览器内置 DOMParser）
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(stylesXml, 'text/xml')

  // 4. 提取样式（示例：提取标题样式）
  const styles = {
    paragraphs: {},
    runs: {},
    tables: {}
  }

  // 提取所有段落样式
  xmlDoc.querySelectorAll('w\\:style[w\\:type="paragraph"]').forEach(node => {
    const name = node.getAttribute('w:name')
    styles.paragraphs[name] = {
      alignment: node.querySelector('w\\:jc')?.getAttribute('w:val') || 'left',
      spacing: {
        before: node.querySelector('w\\:spacing')?.getAttribute('w:before') || '0',
        after: node.querySelector('w\\:spacing')?.getAttribute('w:after') || '0'
      }
    }
  })

  return styles
}

const exportToWord = async () => {
// 1. 读取模板文件
  const response = await fetch("/templates/测试模板.docx")
  const templateFile = await response.arrayBuffer()
  // 2. 提取样式
  const result = await mammoth.extractRawText({arrayBuffer: templateFile});

  console.log("文档样式:", result);
  return
  // Create table rows for the header
  const headerRows = [
    // Title row
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "四川新为橡塑有限公司检测中心",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Sichuan Xinwei Rubber Co., LTD. Test Report Testing Center",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "检 测 报 告",
                  bold: true,
                  size: "24pt",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Test Report",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 18,
          margins: {
            top: 100,
            bottom: 100,
          },
        }),
      ],
    }),
    // Report number row
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "报告编号Report No.：XWJC/TR-2024-1121-05",
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          columnSpan: 18,
          margins: {
            right: 400,
          },
        }),
      ],
    }),
    // Sample info row
    new TableRow({
      children: [
        // Sample name header
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "样品名称", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Sample Name", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 4,
          shading: {
            fill: "F2F2F2",
          },
        }),
        // Sample name data
        new TableCell({
          children: [new Paragraph({text: "66#胶"})],
          columnSpan: 5,
        }),
        // Sample number header
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "样品编号", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Sample NO.", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 5,
          shading: {
            fill: "F2F2F2",
          },
        }),
        // Sample number data
        new TableCell({
          children: [new Paragraph({text: "2024-11-19-01"})],
          columnSpan: 4,
        }),
      ],
    }),
    // Test info row
    new TableRow({
      children: [
        // Test date header
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "检测日期", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Test Date", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 4,
          shading: {
            fill: "F2F2F2",
          },
        }),
        // Test date data
        new TableCell({
          children: [new Paragraph({text: "2024.11.21"})],
          columnSpan: 5,
        }),
        // Test spot header
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "检测地点", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Test Spot", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 5,
          shading: {
            fill: "F2F2F2",
          },
        }),
        // Test spot data
        new TableCell({
          children: [new Paragraph({text: "物理检测室"})],
          columnSpan: 4,
        }),
      ],
    }),
  ];

  // Create table rows for the body
  const bodyRows = [
    // Environmental condition
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "环境条件", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Environmental Condition", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 4,
          shading: {
            fill: "F2F2F2",
          },
        }),
        new TableCell({
          children: [new Paragraph({text: "温度：23℃，湿度：60%"})],
          columnSpan: 14,
        }),
      ],
    }),
    // Equipment
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "仪器设备", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Equipments", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 4,
          shading: {
            fill: "F2F2F2",
          },
        }),
        new TableCell({
          children: [
            new Paragraph({text: "邵A硬度计/JSSB-058(有效期：2023.11.27~2024.11.26)"}),
            new Paragraph({text: "高低温拉力机/JSSB-059（有效期：2024.4.20~2025.4.19）"}),
            new Paragraph({text: "门尼黏度仪/JSSB-021（有效期：2023.10.26~2024.10.25）"}),
          ],
          columnSpan: 14,
        }),
      ],
    }),
    // Test conclusion
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "检测结论", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Test Conclusion", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 4,
          shading: {
            fill: "F2F2F2",
          },
        }),
        new TableCell({
          children: [
            new Paragraph({text: "☑合格 ☐不合格"}),
            new Paragraph({text: "检测结果判定规则依据公司内部质量控制技术要求。"}),
          ],
          columnSpan: 14,
        }),
      ],
    }),
    // Test items and results title
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "检测项目及结果", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Test Item and Result", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 17,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "结果判定"})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Result Determination"})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: "center",
          rowSpan: 4,
        }),
      ],
    }),
    // Test items header
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "序号"})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "NO."})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          rowSpan: 3,
          verticalAlign: "center",
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "检测项目", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Test Item", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [new Paragraph({text: "硬度（邵A）/Shore A"})],
        }),
        new TableCell({
          children: [new Paragraph({text: "拉伸强度/MPa"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "断裂伸长率/%"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "100%定伸应力/MPa"})],
          columnSpan: 3,
        }),
        new TableCell({
          children: [new Paragraph({text: "300%定伸应力/MPa"})],
        }),
        new TableCell({
          children: [new Paragraph({text: "门尼(母炼)/ML(1+4)100℃"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "门尼(终炼)/ML(1+4)100℃"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "密度/Mg/m³"})],
          columnSpan: 2,
        }),
      ],
    }),
    // Technical requirements
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "技术要求", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Technical Requirement", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [new Paragraph({text: "80~90"})],
        }),
        new TableCell({
          children: [new Paragraph({text: "≥18"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "≥260"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "≥6"})],
          columnSpan: 3,
        }),
        new TableCell({
          children: [new Paragraph({text: ""})],
        }),
        new TableCell({
          children: [new Paragraph({text: "≤95"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "≤82"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: ""})],
          columnSpan: 2,
        }),
      ],
    }),
    // Test methods
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "检测方法", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Test Method", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [new Paragraph({text: "GB/T 531.1-2008"})],
        }),
        new TableCell({
          children: [new Paragraph({text: "GB/T 528-2009"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "GB/T 528-2009"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "GB/T 528-2009"})],
          columnSpan: 3,
        }),
        new TableCell({
          children: [new Paragraph({text: "GB/T 528-2009"})],
        }),
        new TableCell({
          children: [new Paragraph({text: "GB/T 1232.1-2016"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: "GB/T 1232.1-2016"})],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph({text: ""})],
          columnSpan: 2,
        }),
      ],
    }),
  ];

  // Add test data rows
  testData.forEach((row) => {
    bodyRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({text: row.id.toString()})],
            columnSpan: 2,
          }),
          new TableCell({
            children: [new Paragraph({text: row.hardness})],
          }),
          new TableCell({
            children: [new Paragraph({text: row.strength})],
            columnSpan: 2,
          }),
          new TableCell({
            children: [new Paragraph({text: row.elongation})],
            columnSpan: 2,
          }),
          new TableCell({
            children: [new Paragraph({text: row.stress100})],
            columnSpan: 3,
          }),
          new TableCell({
            children: [new Paragraph({text: row.stress300})],
          }),
          new TableCell({
            children: [new Paragraph({text: row.mooneyMother})],
            columnSpan: 2,
          }),
          new TableCell({
            children: [new Paragraph({text: row.mooneyFinal})],
            columnSpan: 2,
          }),
          new TableCell({
            children: [new Paragraph({text: row.density})],
            columnSpan: 2,
          }),
          new TableCell({
            children: [new Paragraph({text: row.result})],
          }),
        ],
      })
    );
  });

  // Add remark row
  bodyRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "备注", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Remark", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 2,
          shading: {
            fill: "F2F2F2",
          },
        }),
        new TableCell({
          children: [new Paragraph({text: "/"})],
          columnSpan: 16,
        }),
      ],
    })
  );

  // Add signature row
  bodyRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "检测人", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Tested by", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 2,
          shading: {
            fill: "F2F2F2",
          },
        }),
        new TableCell({
          children: [new Paragraph({text: ""})],
          columnSpan: 4,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "复核人", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Checked by", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 2,
          shading: {
            fill: "F2F2F2",
          },
        }),
        new TableCell({
          children: [new Paragraph({text: ""})],
          columnSpan: 4,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({text: "批准人", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({text: "Approved by", bold: true})],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 4,
          shading: {
            fill: "F2F2F2",
          },
        }),
        new TableCell({
          children: [new Paragraph({text: ""})],
          columnSpan: 2,
        }),
      ],
    })
  );

  // Create the table with all rows
  const table = new Table({
    rows: [...headerRows, ...bodyRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: {style: "single", size: 4, color: "000000"},
      bottom: {style: "single", size: 4, color: "000000"},
      left: {style: "single", size: 4, color: "000000"},
      right: {style: "single", size: 4, color: "000000"},
      insideHorizontal: {style: "single", size: 4, color: "000000"},
      insideVertical: {style: "single", size: 4, color: "000000"},
    },
    columnWidths: colWidths.map(width => width * 10), // 示例系数，根据实际调整
  });

  // Create the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          // 关键点1：直接交换宽高（物理层面强制横向）
          size: {
            width: 16838,  // 11.69英寸（A4横向宽度）
            height: 11906, // 8.27英寸（A4纵向高度）
          },
          // 关键点2：添加页面旋转（某些Word版本需要）
          pageBorders: {
            display: "all",
            offsetFrom: "page",
            zOrder: "back",
          },
        },
      },
      children: [
        // 关键点3：强制插入横向段落（防止Word自动重置方向）
        new Paragraph({
          children: [new TextRun({text: "", break: 1})], // 隐藏的换行符
          pageBreakBefore: true,
        }),
        table,
      ],
    }],
  });

  // Generate the Word document
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "检测报告_Test_Report.docx");
  });
};
</script>

<style scoped>
.word-document {
  font-family: "SimSun", "宋体", serif;
  width: 1400px;
  height: 700px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  line-height: 1.5;
  color: #000;
  font-size: 12pt;
  overflow: auto;
}

.word-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  margin: 0 auto;
}

.word-table th,
.word-table td {
  border: 1px solid #000;
  padding: 5px;
  text-align: center;
  vertical-align: middle;
}

.table-title {
  font-size: 14pt;
  line-height: 1.8;
  padding: 10px;
}

.title-bold {
  font-weight: bold;
  font-size: 16pt;
}

.report-number {
  text-align: right !important;
  padding-right: 20px;
}

.table-header {
  font-weight: bold;
  background-color: #f2f2f2;
}

.table-header p,
.test-result-title p {
  margin: 2px 0;
}

.test-result-title {
  font-weight: bold;
  padding: 5px;
}

.table-data {
  padding: 5px;
}

.vertical-header {
  writing-mode: vertical-rl;
  text-align: center;
  vertical-align: middle;
  transform: rotate(180deg);
  white-space: nowrap;
  padding: 5px 3px;
}

.vertical-header p {
  margin: 3px 0;
}

.word-table sup {
  vertical-align: super;
  font-size: smaller;
}
</style>
